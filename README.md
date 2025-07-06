# 🏠 Property Listing System

A robust RESTful APIs for managing property listings with advanced features including authentication, property management, pagination and filtering, managing favorites, recommendations, and caching.

## 🚀 Live Demo

- **API Deployment**: [Render](https://property-listing-system-otf5.onrender.com)
- **Video Demo**: [Watch on Google Drive](https://drive.google.com/file/d/10DgZe90S6RePXa3tTegvqqyDWRm_GkoL/view?usp=drive_link)

## ✨ Features

- **Authentication System** - JWT-based secure user authentication
- **Property Management** - CRUD operations with advanced filtering
- **Favorites System** - Allow users to save and manage favorite properties
- **Recommendation System** - Users can recommend properties to others
- **Redis Cloud Caching** - Improved performance with redis implementation
- **MongoDB Integration** - Scalable NoSQL database storage

## 🛠️ Tech Stack

- **Node.js & Express** - Backend framework
- **MongoDB Atlas** - Database
- **Redis Cloud** - Caching layer
- **JWT** - Authentication
- **ioredis** - Redis client for Node.js

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account
- Redis Cloud account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/property-listing-system.git
   cd property-listing-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   REDIS_URL=your_redis_cloud_url
   CACHE_TTL=3600
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Sample Data
- Sample property data is available at `src/utils/data.csv`
- Import this data to quickly populate your database

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Property Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/properties` | Get all properties (with filtering) | No |
| GET | `/api/v1/properties/:id` | Get property by ID | No |
| POST | `/api/v1/properties` | Create property | Yes |
| PUT | `/api/v1/properties/:id` | Update property | Yes (owner only) |
| DELETE | `/api/v1/properties/:id` | Delete property | Yes (owner only) |
| POST | `/api/v1/properties/filter` | Advanced property filtering | No |

### Favorites Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/favorites` | Get user favorites | Yes |
| POST | `/api/v1/favorites/:propertyId` | Add to favorites | Yes |
| DELETE | `/api/v1/favorites/:propertyId` | Remove from favorites | Yes |
| GET | `/api/v1/favorites/:propertyId/check` | Check if in favorites | Yes |

### Recommendations Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/recommendations/received` | Get received recommendations | Yes |
| GET | `/api/v1/recommendations/search-users` | Search users by email | Yes |
| POST | `/api/v1/recommendations/:propertyId/recommend` | Recommend property | Yes |
| DELETE | `/api/v1/recommendations/received/:id` | Remove recommendation | Yes |

## 📊 Property Model

```javascript
{
  propertyId: String,
  title: String,
  type: String,        
  price: Number,
  state: String,
  city: String,
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  furnished: String,
  availableFrom: Date,
  listedBy: String,
  tags: [String],      
  colorTheme: String,  
  rating: Number,      
  isVerified: Boolean,
  listingType: String,
  createdBy: ObjectId
}
```

## 🧪 Testing

A comprehensive Postman collection is included in the repository (`postman_collection.json`) to help test all API endpoints.

1. Import the collection into Postman
2. Set up environment variables:
   - `base_url`: Your API URL (e.g., `http://localhost:5000`)
   - `token`: Will be automatically populated after login
   - `property_id`: Will be populated when creating properties
   - `recipient_user_id`: For recommendation testing
   - `recommendation_id`: For recommendation management

## 🔒 Redis Cloud Caching

The API uses Redis Cloud with ioredis for efficient caching:

- GET requests for properties are cached to improve response time
- Cache is automatically invalidated when properties are created/updated/deleted
- Default cache TTL is 1 hour (configurable via environment variables)