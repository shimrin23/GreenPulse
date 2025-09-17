const express = require("express")
const { body, validationResult, param } = require("express-validator")
const Tree = require("../models/Tree")
const User = require("../models/User")
const { authenticateToken, optionalAuth, checkOwnership } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

// Validation rules
const treeValidation = [
  body("treeType").trim().isLength({ min: 2, max: 50 }).withMessage("Tree type must be between 2 and 50 characters"),
  body("location.address")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address must be between 5 and 200 characters"),
  body("location.coordinates.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("location.coordinates.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("plantingDate")
    .isISO8601()
    .withMessage("Please provide a valid planting date")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("Planting date cannot be in the future")
      }
      return true
    }),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("species").optional().trim().isLength({ max: 100 }).withMessage("Species cannot exceed 100 characters"),
  body("height").optional().isFloat({ min: 0 }).withMessage("Height must be a positive number"),
  body("diameter").optional().isFloat({ min: 0 }).withMessage("Diameter must be a positive number"),
]

// @route   GET /api/trees
// @desc    Get all trees with pagination and filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      treeType,
      city,
      state,
      country,
      plantedBy,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      verified,
    } = req.query

    // Build filter object
    const filter = { isActive: true }

    if (treeType) filter.treeType = new RegExp(treeType, "i")
    if (city) filter["location.city"] = new RegExp(city, "i")
    if (state) filter["location.state"] = new RegExp(state, "i")
    if (country) filter["location.country"] = new RegExp(country, "i")
    if (plantedBy) filter.plantedBy = plantedBy
    if (verified !== undefined) filter.isVerified = verified === "true"

    if (search) {
      filter.$or = [
        { treeType: new RegExp(search, "i") },
        { species: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { "location.address": new RegExp(search, "i") },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const trees = await Tree.find(filter)
      .populate("plantedBy", "name profilePicture")
      .populate("verifiedBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .lean()

    const total = await Tree.countDocuments(filter)
    const totalPages = Math.ceil(total / Number.parseInt(limit))

    // Add user-specific data if authenticated
    const treesWithUserData = trees.map((tree) => ({
      ...tree,
      isLikedByUser: req.user ? tree.likes.some((like) => like.user.toString() === req.user._id.toString()) : false,
      likeCount: tree.likes.length,
      commentCount: tree.comments.length,
    }))

    res.json({
      trees: treesWithUserData,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalTrees: total,
        hasNextPage: Number.parseInt(page) < totalPages,
        hasPrevPage: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get trees error:", error)
    res.status(500).json({
      message: "Failed to fetch trees",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/trees/:id
// @desc    Get single tree by ID
// @access  Public
router.get("/:id", optionalAuth, [param("id").isMongoId().withMessage("Invalid tree ID")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const tree = await Tree.findOne({ _id: req.params.id, isActive: true })
      .populate("plantedBy", "name profilePicture bio location treesPlanted")
      .populate("verifiedBy", "name")
      .populate("comments.user", "name profilePicture")
      .lean()

    if (!tree) {
      return res.status(404).json({
        message: "Tree not found",
        code: "TREE_NOT_FOUND",
      })
    }

    // Add user-specific data if authenticated
    const treeWithUserData = {
      ...tree,
      isLikedByUser: req.user ? tree.likes.some((like) => like.user.toString() === req.user._id.toString()) : false,
      likeCount: tree.likes.length,
      commentCount: tree.comments.length,
    }

    res.json({ tree: treeWithUserData })
  } catch (error) {
    console.error("Get tree error:", error)
    res.status(500).json({
      message: "Failed to fetch tree",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   POST /api/trees
// @desc    Create a new tree entry
// @access  Private
router.post("/", authenticateToken, upload.array("images", 5), treeValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
        code: "NO_IMAGES",
      })
    }

    const { treeType, species, location, plantingDate, description, height, diameter, healthStatus, tags } = req.body

    // Process uploaded images
    const images = req.files.map((file) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      uploadedAt: new Date(),
    }))

    // Parse location if it's a string
    const parsedLocation = typeof location === "string" ? JSON.parse(location) : location

    // Parse tags if it's a string
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags

    const tree = new Tree({
      treeType,
      species,
      plantedBy: req.user._id,
      location: parsedLocation,
      plantingDate: new Date(plantingDate),
      images,
      description,
      height: height ? Number.parseFloat(height) : null,
      diameter: diameter ? Number.parseFloat(diameter) : null,
      healthStatus: healthStatus || "good",
      tags: parsedTags || [],
    })

    await tree.save()

    // Populate the tree data for response
    const populatedTree = await Tree.findById(tree._id).populate("plantedBy", "name profilePicture").lean()

    res.status(201).json({
      message: "Tree registered successfully",
      tree: populatedTree,
    })
  } catch (error) {
    console.error("Create tree error:", error)
    res.status(500).json({
      message: "Failed to register tree",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   PUT /api/trees/:id
// @desc    Update tree entry
// @access  Private (Owner only)
router.put(
  "/:id",
  authenticateToken,
  [param("id").isMongoId().withMessage("Invalid tree ID"), ...treeValidation],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const tree = await Tree.findOne({ _id: req.params.id, isActive: true })

      if (!tree) {
        return res.status(404).json({
          message: "Tree not found",
          code: "TREE_NOT_FOUND",
        })
      }

      // Check ownership
      if (tree.plantedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Access denied. You can only modify your own trees.",
          code: "OWNERSHIP_REQUIRED",
        })
      }

      const { treeType, species, location, plantingDate, description, height, diameter, healthStatus, tags } = req.body

      // Update fields
      if (treeType) tree.treeType = treeType
      if (species !== undefined) tree.species = species
      if (location) tree.location = typeof location === "string" ? JSON.parse(location) : location
      if (plantingDate) tree.plantingDate = new Date(plantingDate)
      if (description !== undefined) tree.description = description
      if (height !== undefined) tree.height = height ? Number.parseFloat(height) : null
      if (diameter !== undefined) tree.diameter = diameter ? Number.parseFloat(diameter) : null
      if (healthStatus) tree.healthStatus = healthStatus
      if (tags !== undefined) tree.tags = typeof tags === "string" ? JSON.parse(tags) : tags

      await tree.save()

      const updatedTree = await Tree.findById(tree._id).populate("plantedBy", "name profilePicture").lean()

      res.json({
        message: "Tree updated successfully",
        tree: updatedTree,
      })
    } catch (error) {
      console.error("Update tree error:", error)
      res.status(500).json({
        message: "Failed to update tree",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// @route   DELETE /api/trees/:id
// @desc    Delete tree entry
// @access  Private (Owner only)
router.delete("/:id", authenticateToken, [param("id").isMongoId().withMessage("Invalid tree ID")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const tree = await Tree.findOne({ _id: req.params.id, isActive: true })

    if (!tree) {
      return res.status(404).json({
        message: "Tree not found",
        code: "TREE_NOT_FOUND",
      })
    }

    // Check ownership
    if (tree.plantedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own trees.",
        code: "OWNERSHIP_REQUIRED",
      })
    }

    // Soft delete
    tree.isActive = false
    await tree.save()

    res.json({
      message: "Tree deleted successfully",
    })
  } catch (error) {
    console.error("Delete tree error:", error)
    res.status(500).json({
      message: "Failed to delete tree",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   POST /api/trees/:id/like
// @desc    Like/unlike a tree
// @access  Private
router.post(
  "/:id/like",
  authenticateToken,
  [param("id").isMongoId().withMessage("Invalid tree ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const tree = await Tree.findOne({ _id: req.params.id, isActive: true })

      if (!tree) {
        return res.status(404).json({
          message: "Tree not found",
          code: "TREE_NOT_FOUND",
        })
      }

      const isLiked = tree.isLikedBy(req.user._id)

      if (isLiked) {
        await tree.removeLike(req.user._id)
      } else {
        await tree.addLike(req.user._id)
      }

      res.json({
        message: isLiked ? "Tree unliked" : "Tree liked",
        isLiked: !isLiked,
        likeCount: tree.likes.length,
      })
    } catch (error) {
      console.error("Like tree error:", error)
      res.status(500).json({
        message: "Failed to like/unlike tree",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// @route   POST /api/trees/:id/comment
// @desc    Add comment to a tree
// @access  Private
router.post(
  "/:id/comment",
  authenticateToken,
  [
    param("id").isMongoId().withMessage("Invalid tree ID"),
    body("text").trim().isLength({ min: 1, max: 300 }).withMessage("Comment must be between 1 and 300 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const tree = await Tree.findOne({ _id: req.params.id, isActive: true })

      if (!tree) {
        return res.status(404).json({
          message: "Tree not found",
          code: "TREE_NOT_FOUND",
        })
      }

      await tree.addComment(req.user._id, req.body.text)

      // Get the updated tree with populated comments
      const updatedTree = await Tree.findById(tree._id).populate("comments.user", "name profilePicture").lean()

      res.status(201).json({
        message: "Comment added successfully",
        comments: updatedTree.comments,
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({
        message: "Failed to add comment",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

module.exports = router
