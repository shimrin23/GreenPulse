const mongoose = require("mongoose")
require("dotenv").config()

const User = require("../models/User")
const Tree = require("../models/Tree")

const createIndexes = async () => {
  try {
    console.log("📊 Creating database indexes...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/greenpulse")
    console.log("✅ Connected to MongoDB")

    // User indexes
    console.log("👥 Creating User indexes...")
    await User.collection.createIndex({ email: 1 }, { unique: true })
    await User.collection.createIndex({ treesPlanted: -1 })
    await User.collection.createIndex({ createdAt: -1 })
    await User.collection.createIndex({ isActive: 1 })
    await User.collection.createIndex({ name: "text", bio: "text" })
    console.log("✅ User indexes created")

    // Tree indexes
    console.log("🌳 Creating Tree indexes...")
    await Tree.collection.createIndex({ plantedBy: 1 })
    await Tree.collection.createIndex({ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 })
    await Tree.collection.createIndex({ plantingDate: -1 })
    await Tree.collection.createIndex({ createdAt: -1 })
    await Tree.collection.createIndex({ isVerified: 1 })
    await Tree.collection.createIndex({ isActive: 1 })
    await Tree.collection.createIndex({ treeType: 1 })
    await Tree.collection.createIndex({ "location.city": 1 })
    await Tree.collection.createIndex({ "location.state": 1 })
    await Tree.collection.createIndex({ "location.country": 1 })
    await Tree.collection.createIndex({ tags: 1 })
    await Tree.collection.createIndex({ healthStatus: 1 })

    // Compound indexes for common queries
    await Tree.collection.createIndex({ isActive: 1, isVerified: 1 })
    await Tree.collection.createIndex({ plantedBy: 1, isActive: 1 })
    await Tree.collection.createIndex({ isActive: 1, plantingDate: -1 })
    await Tree.collection.createIndex({
      "location.coordinates.latitude": 1,
      "location.coordinates.longitude": 1,
      isActive: 1,
    })

    // Text search index
    await Tree.collection.createIndex({
      treeType: "text",
      species: "text",
      description: "text",
      "location.address": "text",
    })

    console.log("✅ Tree indexes created")

    // Geospatial index for location-based queries
    await Tree.collection.createIndex({ "location.coordinates": "2dsphere" })
    console.log("✅ Geospatial index created")

    console.log("🎉 All indexes created successfully!")

    // Display index information
    const userIndexes = await User.collection.listIndexes().toArray()
    const treeIndexes = await Tree.collection.listIndexes().toArray()

    console.log(`📊 Index Summary:`)
    console.log(`   - User indexes: ${userIndexes.length}`)
    console.log(`   - Tree indexes: ${treeIndexes.length}`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating indexes:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes()
}

module.exports = createIndexes
