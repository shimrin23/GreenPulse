const express = require("express")
const { param, validationResult } = require("express-validator")
const User = require("../models/User")
const Tree = require("../models/Tree")
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const { profileUpload, handleUploadError, cloudinary } = require("../middleware/upload")

const router = express.Router()

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get("/:id", optionalAuth, [param("id").isMongoId().withMessage("Invalid user ID")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const user = await User.findOne({ _id: req.params.id, isActive: true }).select("-password").lean()

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    // Get user's trees
    const trees = await Tree.find({
      plantedBy: req.params.id,
      isActive: true,
    })
      .select("treeType plantingDate location images isVerified")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get user's rank
    const rank =
      (await User.countDocuments({
        treesPlanted: { $gt: user.treesPlanted },
        isActive: true,
      })) + 1

    // Calculate additional stats
    const totalTrees = await Tree.countDocuments({
      plantedBy: req.params.id,
      isActive: true,
    })

    const verifiedTrees = await Tree.countDocuments({
      plantedBy: req.params.id,
      isActive: true,
      isVerified: true,
    })

    const recentTrees = await Tree.countDocuments({
      plantedBy: req.params.id,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })

    res.json({
      user: {
        ...user,
        rank,
        stats: {
          totalTrees,
          verifiedTrees,
          recentTrees,
        },
      },
      trees,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/users/:id/trees
// @desc    Get user's trees with pagination
// @access  Public
router.get("/:id/trees", optionalAuth, [param("id").isMongoId().withMessage("Invalid user ID")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Check if user exists
    const user = await User.findOne({ _id: req.params.id, isActive: true })
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const trees = await Tree.find({
      plantedBy: req.params.id,
      isActive: true,
    })
      .populate("plantedBy", "name profilePicture")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .lean()

    const total = await Tree.countDocuments({
      plantedBy: req.params.id,
      isActive: true,
    })

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
    console.error("Get user trees error:", error)
    res.status(500).json({
      message: "Failed to fetch user trees",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   POST /api/users/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post(
  "/upload-profile-picture",
  authenticateToken,
  profileUpload.single("profilePicture"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
          code: "NO_FILE",
        })
      }

      const user = await User.findById(req.user._id)

      // Delete old profile picture from Cloudinary if exists
      if (user.profilePicture && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          // Extract public ID from URL
          const urlParts = user.profilePicture.split("/")
          const publicIdWithExtension = urlParts[urlParts.length - 1]
          const publicId = publicIdWithExtension.split(".")[0]
          await cloudinary.uploader.destroy(`greenpulse/profiles/${publicId}`)
        } catch (deleteError) {
          console.error("Error deleting old profile picture:", deleteError)
        }
      }

      // Update user profile picture
      user.profilePicture = req.file.path // Cloudinary URL or local path
      await user.save()

      res.json({
        message: "Profile picture uploaded successfully",
        profilePicture: user.profilePicture,
      })
    } catch (error) {
      console.error("Upload profile picture error:", error)
      res.status(500).json({
        message: "Failed to upload profile picture",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

module.exports = router
