const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("cloudinary").v2
const path = require("path")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "greenpulse/trees",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }, { fetch_format: "auto" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      return `tree-${uniqueSuffix}`
    },
  },
})

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/trees/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `tree-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."), false)
  }
}

// Configure multer
const upload = multer({
  storage: process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files per upload
  },
})

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 5MB per image.",
        code: "FILE_TOO_LARGE",
      })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files. Maximum 5 images allowed.",
        code: "TOO_MANY_FILES",
      })
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected field name for file upload.",
        code: "UNEXPECTED_FIELD",
      })
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: error.message,
      code: "INVALID_FILE_TYPE",
    })
  }

  // Cloudinary errors
  if (error.message.includes("cloudinary")) {
    return res.status(500).json({
      message: "Image upload service error. Please try again.",
      code: "UPLOAD_SERVICE_ERROR",
    })
  }

  next(error)
}

// Utility function to delete uploaded files on error
const cleanupUploadedFiles = async (files) => {
  if (!files || files.length === 0) return

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Delete from Cloudinary
      const deletePromises = files.map((file) => {
        if (file.filename) {
          return cloudinary.uploader.destroy(file.filename)
        }
      })
      await Promise.all(deletePromises)
    } else {
      // Delete from local storage
      const fs = require("fs").promises
      const deletePromises = files.map((file) => {
        if (file.path) {
          return fs.unlink(file.path).catch(() => {}) // Ignore errors
        }
      })
      await Promise.all(deletePromises)
    }
  } catch (error) {
    console.error("Error cleaning up uploaded files:", error)
  }
}

// Profile picture upload configuration
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "greenpulse/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      return `profile-${req.user._id}-${Date.now()}`
    },
  },
})

const profileUpload = multer({
  storage: process.env.CLOUDINARY_CLOUD_NAME ? profilePictureStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for profile pictures
    files: 1,
  },
})

module.exports = {
  upload,
  profileUpload,
  handleUploadError,
  cleanupUploadedFiles,
  cloudinary,
}
