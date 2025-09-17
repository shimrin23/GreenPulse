const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Validation rules
const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password")
    }
    return true
  }),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
        code: "USER_EXISTS",
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      treesPlanted: user.treesPlanted,
      joinDate: user.joinDate,
    }

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userData,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email, isActive: true }).select("+password")
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      treesPlanted: user.treesPlanted,
      joinDate: user.joinDate,
      lastLogin: user.lastLogin,
    }

    res.json({
      message: "Login successful",
      token,
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("plantedTrees", "treeType plantingDate location images")
      .select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    const rank = await user.getRank()

    res.json({
      user: {
        ...user.toObject(),
        rank,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      message: "Failed to get user profile",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("bio").optional().trim().isLength({ max: 200 }).withMessage("Bio cannot exceed 200 characters"),
    body("location").optional().trim().isLength({ max: 100 }).withMessage("Location cannot exceed 100 characters"),
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

      const { name, bio, location } = req.body
      const updateData = {}

      if (name) updateData.name = name
      if (bio !== undefined) updateData.bio = bio
      if (location !== undefined) updateData.location = location

      const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select(
        "-password",
      )

      res.json({
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        message: "Failed to update profile",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
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

      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await User.findById(req.user._id).select("+password")

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({
        message: "Failed to change password",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

module.exports = router
