const mongoose = require("mongoose")

const treeSchema = new mongoose.Schema(
  {
    treeType: {
      type: String,
      required: [true, "Tree type is required"],
      trim: true,
      maxlength: [50, "Tree type cannot exceed 50 characters"],
    },
    species: {
      type: String,
      trim: true,
      maxlength: [100, "Species cannot exceed 100 characters"],
    },
    plantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Planter information is required"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, "Latitude is required"],
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          required: [true, "Longitude is required"],
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
      city: String,
      state: String,
      country: String,
    },
    plantingDate: {
      type: Date,
      required: [true, "Planting date is required"],
      validate: {
        validator: (date) => date <= new Date(),
        message: "Planting date cannot be in the future",
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String, // For Cloudinary
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
      default: null, // in centimeters
    },
    diameter: {
      type: Number,
      min: [0, "Diameter cannot be negative"],
      default: null, // in centimeters
    },
    healthStatus: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "dead"],
      default: "good",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [300, "Comment cannot exceed 300 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
treeSchema.index({ plantedBy: 1 })
treeSchema.index({ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 })
treeSchema.index({ plantingDate: -1 })
treeSchema.index({ createdAt: -1 })
treeSchema.index({ isVerified: 1 })
treeSchema.index({ treeType: 1 })

// Virtual for like count
treeSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0
})

// Virtual for comment count
treeSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0
})

// Method to check if user liked the tree
treeSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user.toString() === userId.toString())
}

// Method to add like
treeSchema.methods.addLike = function (userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId })
  }
  return this.save()
}

// Method to remove like
treeSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter((like) => like.user.toString() !== userId.toString())
  return this.save()
}

// Method to add comment
treeSchema.methods.addComment = function (userId, text) {
  this.comments.push({ user: userId, text })
  return this.save()
}

// Update user's tree count after save
treeSchema.post("save", async function () {
  if (this.isVerified) {
    const User = mongoose.model("User")
    const user = await User.findById(this.plantedBy)
    if (user) {
      await user.updateTreeCount()
    }
  }
})

// Update user's tree count after remove
treeSchema.post("remove", async function () {
  const User = mongoose.model("User")
  const user = await User.findById(this.plantedBy)
  if (user) {
    await user.updateTreeCount()
  }
})

module.exports = mongoose.model("Tree", treeSchema)
