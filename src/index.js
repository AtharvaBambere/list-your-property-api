const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const config = require('./config/config');


const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const favoriteRoutes = require('./routes/favorites');
const recommendationRoutes = require('./routes/recommendations');


const app = express();


connectDB();


connectRedis();


app.use(express.json());
app.use(cors());


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Property Listing API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      properties: '/api/v1/properties',
      favorites: '/api/v1/favorites',
      recommendations: '/api/v1/recommendations'
    }
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});


const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  
  server.close(() => process.exit(1));
});

module.exports = app; 