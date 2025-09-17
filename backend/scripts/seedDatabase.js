const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Tree = require("../models/Tree")

// Sample data
const sampleUsers = [
  {
    name: "Emma Johnson",
    email: "emma@example.com",
    password: "Password123",
    bio: "Environmental enthusiast and tree lover",
    location: "San Francisco, CA",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Daniel Smith",
    email: "daniel@example.com",
    password: "Password123",
    bio: "Urban forester working to green our cities",
    location: "Portland, OR",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Sophia Chen",
    email: "sophia@example.com",
    password: "Password123",
    bio: "Climate activist and sustainability advocate",
    location: "Seattle, WA",
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Liam Wilson",
    email: "liam@example.com",
    password: "Password123",
    bio: "Botanist specializing in native species",
    location: "Austin, TX",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Maya Patel",
    email: "maya@example.com",
    password: "Password123",
    bio: "Community organizer for environmental justice",
    location: "Denver, CO",
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
]

const treeTypes = [
  "Oak",
  "Maple",
  "Pine",
  "Birch",
  "Cedar",
  "Willow",
  "Cherry",
  "Apple",
  "Redwood",
  "Eucalyptus",
  "Palm",
  "Magnolia",
  "Dogwood",
  "Elm",
  "Ash",
]

const cities = [
  { name: "San Francisco", state: "CA", country: "USA", lat: 37.7749, lng: -122.4194 },
  { name: "Portland", state: "OR", country: "USA", lat: 45.5152, lng: -122.6784 },
  { name: "Seattle", state: "WA", country: "USA", lat: 47.6062, lng: -122.3321 },
  { name: "Austin", state: "TX", country: "USA", lat: 30.2672, lng: -97.7431 },
  { name: "Denver", state: "CO", country: "USA", lat: 39.7392, lng: -104.9903 },
  { name: "New York", state: "NY", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", state: "IL", country: "USA", lat: 41.8781, lng: -87.6298 },
]

// Generate random coordinates near a city
const generateNearbyCoordinates = (city, radiusKm = 50) => {
  const radiusInDegrees = radiusKm / 111 // Rough conversion
  const lat = city.lat + (Math.random() - 0.5) * 2 * radiusInDegrees
  const lng = city.lng + (Math.random() - 0.5) * 2 * radiusInDegrees
  return { lat, lng }
}

// Generate sample trees for a user
const generateSampleTrees = (userId, count = 10) => {
  const trees = []

  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)]
    const coords = generateNearbyCoordinates(city)
    const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)]

    // Random date within last 2 years
    const plantingDate = new Date()
    plantingDate.setDate(plantingDate.getDate() - Math.floor(Math.random() * 730))

    trees.push({
      treeType,
      species: `${treeType} ${["americana", "vulgaris", "occidentalis", "orientalis"][Math.floor(Math.random() * 4)]}`,
      plantedBy: userId,
      location: {
        address: `${Math.floor(Math.random() * 9999) + 1} ${["Main St", "Oak Ave", "Pine Rd", "Cedar Ln", "Elm Dr"][Math.floor(Math.random() * 5)]}, ${city.name}, ${city.state}`,
        coordinates: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        city: city.name,
        state: city.state,
        country: city.country,
      },
      plantingDate,
      images: [
        {
          url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop&crop=center`,
          caption: `Beautiful ${treeType.toLowerCase()} tree planted in ${city.name}`,
          uploadedAt: plantingDate,
        },
      ],
      description: [
        `Planted this beautiful ${treeType.toLowerCase()} to help combat climate change.`,
        `Contributing to urban forestry with this ${treeType.toLowerCase()} tree.`,
        `Adding green space to our community with this ${treeType.toLowerCase()}.`,
        `Proud to plant this ${treeType.toLowerCase()} for future generations.`,
      ][Math.floor(Math.random() * 4)],
      height: Math.floor(Math.random() * 200) + 50, // 50-250 cm
      healthStatus: ["excellent", "good", "good", "good", "fair"][Math.floor(Math.random() * 5)], // Bias toward good health
      isVerified: Math.random() > 0.3, // 70% verification rate
      tags: [
        ["urban-forestry", "climate-action"],
        ["community-garden", "sustainability"],
        ["native-species", "biodiversity"],
        ["carbon-offset", "green-city"],
        ["environmental-restoration"],
      ][Math.floor(Math.random() * 5)],
    })
  }

  return trees
}

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/greenpulse")
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await User.deleteMany({})
    await Tree.deleteMany({})
    console.log("✅ Existing data cleared")

    // Create users
    console.log("👥 Creating sample users...")
    const createdUsers = []

    for (const userData of sampleUsers) {
      const user = new User(userData)
      await user.save()
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.name}`)
    }

    // Create trees for each user
    console.log("🌳 Creating sample trees...")
    let totalTrees = 0

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i]
      const treeCount = Math.floor(Math.random() * 20) + 10 // 10-30 trees per user
      const trees = generateSampleTrees(user._id, treeCount)

      await Tree.insertMany(trees)
      totalTrees += treeCount

      // Update user's tree count
      await user.updateTreeCount()

      console.log(`✅ Created ${treeCount} trees for ${user.name}`)
    }

    // Add some likes and comments
    console.log("❤️ Adding likes and comments...")
    const allTrees = await Tree.find({})
    const allUsers = await User.find({})

    for (const tree of allTrees.slice(0, 50)) {
      // Add interactions to first 50 trees
      // Random likes
      const likeCount = Math.floor(Math.random() * 8)
      for (let i = 0; i < likeCount; i++) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
        if (!tree.isLikedBy(randomUser._id)) {
          await tree.addLike(randomUser._id)
        }
      }

      // Random comments
      const commentCount = Math.floor(Math.random() * 4)
      const sampleComments = [
        "Beautiful tree! Great work!",
        "Love seeing more green in our community.",
        "This is inspiring! Keep it up!",
        "What a wonderful contribution to the environment.",
        "Amazing! How long did it take to grow?",
        "This tree will make a real difference.",
      ]

      for (let i = 0; i < commentCount; i++) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]
        await tree.addComment(randomUser._id, randomComment)
      }
    }

    console.log("🎉 Database seeding completed successfully!")
    console.log(`📊 Summary:`)
    console.log(`   - Users created: ${createdUsers.length}`)
    console.log(`   - Trees created: ${totalTrees}`)
    console.log(`   - Verified trees: ${await Tree.countDocuments({ isVerified: true })}`)
    console.log(
      `   - Total likes: ${(await Tree.aggregate([{ $project: { likeCount: { $size: "$likes" } } }, { $group: { _id: null, total: { $sum: "$likeCount" } } }]))[0]?.total || 0}`,
    )
    console.log(
      `   - Total comments: ${(await Tree.aggregate([{ $project: { commentCount: { $size: "$comments" } } }, { $group: { _id: null, total: { $sum: "$commentCount" } } }]))[0]?.total || 0}`,
    )

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
