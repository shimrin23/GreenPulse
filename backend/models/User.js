const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },
    treesPlanted: {
      type: Number,
      default: 0,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for user's planted trees
userSchema.virtual("plantedTrees", {
  ref: "Tree",
  localField: "_id",
  foreignField: "plantedBy",
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ treesPlanted: -1 })
userSchema.index({ createdAt: -1 })

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update trees planted count
userSchema.methods.updateTreeCount = async function () {
  const Tree = mongoose.model("Tree")
  const count = await Tree.countDocuments({ plantedBy: this._id, isVerified: true })
  this.treesPlanted = count
  return await this.save()
}

// Get user's rank
userSchema.methods.getRank = async function () {
  const User = mongoose.model("User")
  const rank = await User.countDocuments({
    treesPlanted: { $gt: this.treesPlanted },
    isActive: true,
  })
  return rank + 1
}

module.exports = mongoose.model("User", userSchema)
