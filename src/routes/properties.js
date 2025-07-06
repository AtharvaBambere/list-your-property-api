const express = require('express');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  filterProperties
} = require('../controllers/properties');

const { protect, checkPropertyOwnership } = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

const router = express.Router();

router
  .route('/')
  .get(cacheMiddleware('properties'), getProperties)
  .post(protect, clearCache('properties*'), createProperty);

router
  .route('/:id')
  .get(cacheMiddleware(), getProperty)
  .put(protect, checkPropertyOwnership, clearCache(['properties*', 'property:*']), updateProperty)
  .delete(protect, checkPropertyOwnership, clearCache(['properties*', 'property:*']), deleteProperty);

router.route('/filter').post(filterProperties);

module.exports = router; 