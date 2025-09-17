const express = require("express")
const Tree = require("../models/Tree")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/map/trees
// @desc    Get trees for map display with clustering
// @access  Public
router.get("/trees", optionalAuth, async (req, res) => {
  try {
    const {
      bounds, // "lat1,lng1,lat2,lng2" - map viewport bounds
      zoom = 10,
      limit = 1000,
      treeType,
      verified,
      dateFrom,
      dateTo,
    } = req.query

    // Build filter
    const filter = { isActive: true }

    if (treeType) filter.treeType = new RegExp(treeType, "i")
    if (verified !== undefined) filter.isVerified = verified === "true"

    // Date range filter
    if (dateFrom || dateTo) {
      filter.plantingDate = {}
      if (dateFrom) filter.plantingDate.$gte = new Date(dateFrom)
      if (dateTo) filter.plantingDate.$lte = new Date(dateTo)
    }

    // Bounds filter for map viewport
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(",").map(Number)
      filter["location.coordinates.latitude"] = {
        $gte: Math.min(lat1, lat2),
        $lte: Math.max(lat1, lat2),
      }
      filter["location.coordinates.longitude"] = {
        $gte: Math.min(lng1, lng2),
        $lte: Math.max(lng1, lng2),
      }
    }

    // Determine if we need clustering based on zoom level
    const needsClustering = Number.parseInt(zoom) < 12

    let trees

    if (needsClustering) {
      // Use aggregation for clustering
      const clusterSize = Number.parseInt(zoom) < 8 ? 0.1 : 0.05 // Degrees for clustering

      trees = await Tree.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              lat: {
                $multiply: [{ $round: { $divide: ["$location.coordinates.latitude", clusterSize] } }, clusterSize],
              },
              lng: {
                $multiply: [{ $round: { $divide: ["$location.coordinates.longitude", clusterSize] } }, clusterSize],
              },
            },
            count: { $sum: 1 },
            trees: { $push: "$$ROOT" },
            avgLat: { $avg: "$location.coordinates.latitude" },
            avgLng: { $avg: "$location.coordinates.longitude" },
            types: { $addToSet: "$treeType" },
            recentDate: { $max: "$plantingDate" },
          },
        },
        {
          $project: {
            _id: 0,
            cluster: true,
            count: 1,
            coordinates: {
              latitude: "$avgLat",
              longitude: "$avgLng",
            },
            types: 1,
            recentDate: 1,
            // Include individual trees if cluster is small
            trees: {
              $cond: [
                { $lte: ["$count", 5] },
                {
                  $map: {
                    input: "$trees",
                    as: "tree",
                    in: {
                      _id: "$$tree._id",
                      treeType: "$$tree.treeType",
                      plantingDate: "$$tree.plantingDate",
                      coordinates: "$$tree.location.coordinates",
                      images: { $arrayElemAt: ["$$tree.images", 0] },
                      plantedBy: "$$tree.plantedBy",
                      isVerified: "$$tree.isVerified",
                    },
                  },
                },
                [],
              ],
            },
          },
        },
        { $limit: Number.parseInt(limit) },
      ])
    } else {
      // Return individual trees for high zoom levels
      trees = await Tree.find(filter)
        .select("treeType plantingDate location.coordinates images plantedBy isVerified")
        .populate("plantedBy", "name profilePicture")
        .limit(Number.parseInt(limit))
        .lean()

      // Format for consistent response
      trees = trees.map((tree) => ({
        _id: tree._id,
        cluster: false,
        count: 1,
        treeType: tree.treeType,
        plantingDate: tree.plantingDate,
        coordinates: tree.location.coordinates,
        images: tree.images[0] || null,
        plantedBy: tree.plantedBy,
        isVerified: tree.isVerified,
      }))
    }

    res.json({
      trees,
      clustered: needsClustering,
      zoom: Number.parseInt(zoom),
      total: trees.length,
    })
  } catch (error) {
    console.error("Get map trees error:", error)
    res.status(500).json({
      message: "Failed to fetch map data",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/map/heatmap
// @desc    Get heatmap data for tree density visualization
// @access  Public
router.get("/heatmap", async (req, res) => {
  try {
    const {
      bounds,
      intensity = "medium", // low, medium, high
    } = req.query

    const filter = { isActive: true, isVerified: true }

    // Bounds filter
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(",").map(Number)
      filter["location.coordinates.latitude"] = {
        $gte: Math.min(lat1, lat2),
        $lte: Math.max(lat1, lat2),
      }
      filter["location.coordinates.longitude"] = {
        $gte: Math.min(lng1, lng2),
        $lte: Math.max(lng1, lng2),
      }
    }

    // Grid size based on intensity
    const gridSizes = {
      low: 0.01, // ~1km
      medium: 0.005, // ~500m
      high: 0.002, // ~200m
    }
    const gridSize = gridSizes[intensity] || gridSizes.medium

    const heatmapData = await Tree.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            lat: {
              $multiply: [{ $round: { $divide: ["$location.coordinates.latitude", gridSize] } }, gridSize],
            },
            lng: {
              $multiply: [{ $round: { $divide: ["$location.coordinates.longitude", gridSize] } }, gridSize],
            },
          },
          weight: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          lat: "$_id.lat",
          lng: "$_id.lng",
          weight: 1,
        },
      },
      { $limit: 10000 }, // Limit for performance
    ])

    res.json({
      heatmap: heatmapData,
      intensity,
      total: heatmapData.length,
    })
  } catch (error) {
    console.error("Get heatmap error:", error)
    res.status(500).json({
      message: "Failed to fetch heatmap data",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/map/regions
// @desc    Get tree statistics by region
// @access  Public
router.get("/regions", async (req, res) => {
  try {
    const { level = "country" } = req.query // country, state, city

    const groupField =
      level === "country" ? "$location.country" : level === "state" ? "$location.state" : "$location.city"

    const regions = await Tree.aggregate([
      { $match: { isActive: true, isVerified: true } },
      {
        $group: {
          _id: groupField,
          treeCount: { $sum: 1 },
          uniquePlanters: { $addToSet: "$plantedBy" },
          treeTypes: { $addToSet: "$treeType" },
          recentPlanting: { $max: "$plantingDate" },
          coordinates: {
            $push: {
              lat: "$location.coordinates.latitude",
              lng: "$location.coordinates.longitude",
            },
          },
        },
      },
      {
        $project: {
          region: "$_id",
          treeCount: 1,
          planterCount: { $size: "$uniquePlanters" },
          typeCount: { $size: "$treeTypes" },
          recentPlanting: 1,
          // Calculate center coordinates
          centerLat: { $avg: "$coordinates.lat" },
          centerLng: { $avg: "$coordinates.lng" },
          _id: 0,
        },
      },
      { $sort: { treeCount: -1 } },
      { $limit: 50 },
    ])

    res.json({
      regions: regions.filter((r) => r.region), // Remove null regions
      level,
    })
  } catch (error) {
    console.error("Get regions error:", error)
    res.status(500).json({
      message: "Failed to fetch region data",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

module.exports = router
