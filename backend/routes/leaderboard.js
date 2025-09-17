const express = require("express")
const User = require("../models/User")
const Tree = require("../models/Tree")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/leaderboard
// @desc    Get user leaderboard with rankings
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      timeframe = "all", // all, month, week
      location, // city, state, or country filter
    } = req.query

    // Build date filter for timeframe
    let dateFilter = {}
    const now = new Date()

    if (timeframe === "month") {
      dateFilter = {
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      }
    } else if (timeframe === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = {
        createdAt: { $gte: weekAgo },
      }
    }

    // Build location filter if provided
    let locationFilter = {}
    if (location) {
      locationFilter = {
        $or: [
          { "location.city": new RegExp(location, "i") },
          { "location.state": new RegExp(location, "i") },
          { "location.country": new RegExp(location, "i") },
        ],
      }
    }

    // Aggregate pipeline to get user rankings
    const pipeline = [
      // Match active trees with date and location filters
      {
        $match: {
          isActive: true,
          isVerified: true,
          ...dateFilter,
          ...locationFilter,
        },
      },
      // Group by user and count trees
      {
        $group: {
          _id: "$plantedBy",
          treeCount: { $sum: 1 },
          recentTree: { $max: "$createdAt" },
          locations: { $addToSet: "$location.city" },
        },
      },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // Unwind user array
      {
        $unwind: "$user",
      },
      // Match only active users
      {
        $match: {
          "user.isActive": true,
        },
      },
      // Project final structure
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          profilePicture: "$user.profilePicture",
          bio: "$user.bio",
          location: "$user.location",
          joinDate: "$user.joinDate",
          treeCount: 1,
          recentTree: 1,
          locations: 1,
          totalTrees: "$user.treesPlanted", // All-time count
        },
      },
      // Sort by tree count (descending)
      {
        $sort: { treeCount: -1, recentTree: -1 },
      },
      // Add rank field
      {
        $group: {
          _id: null,
          users: { $push: "$$ROOT" },
        },
      },
      {
        $unwind: {
          path: "$users",
          includeArrayIndex: "rank",
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$users", { rank: { $add: ["$rank", 1] } }],
          },
        },
      },
      // Pagination
      {
        $skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
      },
      {
        $limit: Number.parseInt(limit),
      },
    ]

    const leaderboard = await Tree.aggregate(pipeline)

    // Get total count for pagination
    const totalPipeline = [
      {
        $match: {
          isActive: true,
          isVerified: true,
          ...dateFilter,
          ...locationFilter,
        },
      },
      {
        $group: {
          _id: "$plantedBy",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.isActive": true,
        },
      },
      {
        $count: "total",
      },
    ]

    const totalResult = await Tree.aggregate(totalPipeline)
    const total = totalResult.length > 0 ? totalResult[0].total : 0
    const totalPages = Math.ceil(total / Number.parseInt(limit))

    // Get top 3 for podium display
    const topThree = leaderboard.slice(0, 3)

    // Add current user's rank if authenticated
    let currentUserRank = null
    if (req.user) {
      const userRankPipeline = [
        {
          $match: {
            isActive: true,
            isVerified: true,
            ...dateFilter,
            ...locationFilter,
          },
        },
        {
          $group: {
            _id: "$plantedBy",
            treeCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            "user.isActive": true,
          },
        },
        {
          $sort: { treeCount: -1 },
        },
        {
          $group: {
            _id: null,
            users: { $push: { userId: "$_id", treeCount: "$treeCount" } },
          },
        },
        {
          $unwind: {
            path: "$users",
            includeArrayIndex: "rank",
          },
        },
        {
          $match: {
            "users.userId": req.user._id,
          },
        },
        {
          $project: {
            rank: { $add: ["$rank", 1] },
            treeCount: "$users.treeCount",
          },
        },
      ]

      const userRankResult = await Tree.aggregate(userRankPipeline)
      if (userRankResult.length > 0) {
        currentUserRank = userRankResult[0]
      }
    }

    res.json({
      leaderboard,
      topThree,
      currentUserRank,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: Number.parseInt(page) < totalPages,
        hasPrevPage: Number.parseInt(page) > 1,
      },
      filters: {
        timeframe,
        location: location || null,
      },
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      message: "Failed to fetch leaderboard",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/leaderboard/stats
// @desc    Get overall platform statistics
// @access  Public
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalTrees, verifiedTrees, recentTrees, topCountries, monthlyGrowth] = await Promise.all([
      // Total active users
      User.countDocuments({ isActive: true }),

      // Total trees planted
      Tree.countDocuments({ isActive: true }),

      // Verified trees
      Tree.countDocuments({ isActive: true, isVerified: true }),

      // Trees planted in last 30 days
      Tree.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),

      // Top countries by tree count
      Tree.aggregate([
        { $match: { isActive: true, isVerified: true } },
        { $group: { _id: "$location.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { country: "$_id", count: 1, _id: 0 } },
      ]),

      // Monthly growth for last 6 months
      Tree.aggregate([
        {
          $match: {
            isActive: true,
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            month: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                {
                  $cond: [
                    { $lt: ["$_id.month", 10] },
                    { $concat: ["0", { $toString: "$_id.month" }] },
                    { $toString: "$_id.month" },
                  ],
                },
              ],
            },
            count: 1,
            _id: 0,
          },
        },
      ]),
    ])

    res.json({
      stats: {
        totalUsers,
        totalTrees,
        verifiedTrees,
        recentTrees,
        verificationRate: totalTrees > 0 ? Math.round((verifiedTrees / totalTrees) * 100) : 0,
      },
      topCountries,
      monthlyGrowth,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

module.exports = router
