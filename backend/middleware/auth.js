const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: "Access token required",
        code: "NO_TOKEN",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid token or user not found",
        code: "INVALID_TOKEN",
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        code: "INVALID_TOKEN",
      })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      })
    }

    console.error("Auth middleware error:", error)
    res.status(500).json({
      message: "Authentication error",
      code: "AUTH_ERROR",
    })
  }
}

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select("-password")

      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Check if user owns resource
const checkOwnership = (resourceField = "plantedBy") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // For routes where we check ownership later in the route handler
    if (!req.resource) {
      return next()
    }

    const resourceUserId = req.resource[resourceField]
    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only modify your own resources.",
        code: "OWNERSHIP_REQUIRED",
      })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  checkOwnership,
}
