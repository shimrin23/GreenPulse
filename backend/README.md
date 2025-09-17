# GreenPulse Backend API

A comprehensive MERN stack backend for the GreenPulse tree planting tracker application.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with bcrypt password hashing
- 🌳 **Tree Management** - CRUD operations for tree entries with geolocation
- 📸 **Image Upload** - Cloudinary integration for tree photos
- 🏆 **Leaderboard System** - User rankings and statistics
- 🗺️ **Map Integration** - Geospatial queries and clustering for map display
- 📊 **Analytics** - Platform statistics and growth metrics
- 🔍 **Search & Filtering** - Advanced search with multiple criteria
- 💬 **Social Features** - Likes, comments, and user interactions

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone and navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit `.env` with your configuration:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/greenpulse
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   \`\`\`

4. **Start the server**
   \`\`\`bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

5. **Seed the database (optional)**
   \`\`\`bash
   npm run seed
   \`\`\`

## MongoDB Compass Connection

### Option 1: Local MongoDB

1. **Install MongoDB locally**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB service

2. **Connect with MongoDB Compass**
   - Open MongoDB Compass
   - Use connection string: `mongodb://localhost:27017`
   - Database name: `greenpulse`

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free cluster

2. **Get connection string**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Connect with MongoDB Compass**
   - Open MongoDB Compass
   - Paste your Atlas connection string
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/greenpulse`

4. **Update .env file**
   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/greenpulse
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Trees
- `GET /api/trees` - Get all trees (with pagination & filtering)
- `GET /api/trees/:id` - Get single tree
- `POST /api/trees` - Create new tree entry
- `PUT /api/trees/:id` - Update tree entry
- `DELETE /api/trees/:id` - Delete tree entry
- `POST /api/trees/:id/like` - Like/unlike tree
- `POST /api/trees/:id/comment` - Add comment to tree

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/trees` - Get user's trees
- `POST /api/users/upload-profile-picture` - Upload profile picture

### Leaderboard
- `GET /api/leaderboard` - Get user rankings
- `GET /api/leaderboard/stats` - Get platform statistics

### Map
- `GET /api/map/trees` - Get trees for map display
- `GET /api/map/heatmap` - Get heatmap data
- `GET /api/map/regions` - Get regional statistics

## Database Schema

### User Model
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  bio: String,
  location: String,
  treesPlanted: Number,
  joinDate: Date,
  isActive: Boolean
}
\`\`\`

### Tree Model
\`\`\`javascript
{
  treeType: String,
  species: String,
  plantedBy: ObjectId (User),
  location: {
    address: String,
    coordinates: { latitude: Number, longitude: Number },
    city: String,
    state: String,
    country: String
  },
  plantingDate: Date,
  images: [{ url: String, publicId: String, caption: String }],
  description: String,
  height: Number,
  diameter: Number,
  healthStatus: String,
  isVerified: Boolean,
  tags: [String],
  likes: [{ user: ObjectId, likedAt: Date }],
  comments: [{ user: ObjectId, text: String, createdAt: Date }]
}
\`\`\`

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `node scripts/createIndexes.js` - Create database indexes

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configured for frontend domain
- **Input Validation** - express-validator for all inputs
- **File Upload Security** - File type and size restrictions
- **Helmet** - Security headers

## Error Handling

The API uses consistent error response format:
\`\`\`json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [] // Validation errors if applicable
}
\`\`\`

## Performance Optimizations

- **Database Indexes** - Optimized queries for common operations
- **Pagination** - All list endpoints support pagination
- **Image Optimization** - Cloudinary automatic optimization
- **Clustering** - Map data clustering for performance
- **Caching Headers** - Appropriate cache headers for static content

## Development

### Adding New Features

1. Create model in `/models` if needed
2. Add routes in `/routes`
3. Add middleware in `/middleware` if needed
4. Update validation rules
5. Add tests (recommended)
6. Update API documentation

### Environment Variables

All environment variables are documented in `.env.example`. Never commit actual `.env` files to version control.

## Deployment

### Heroku Deployment

1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to GitHub repository
4. Deploy from main branch

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in backend directory
3. Set environment variables in Vercel dashboard
4. Deploy

## Support

For issues and questions:
- Check the API documentation
- Review error messages and logs
- Ensure all environment variables are set correctly
- Verify MongoDB connection
- Check Cloudinary configuration for image uploads

## License

MIT License - see LICENSE file for details.
