const express = require('express');
const {
  getRecommendationsReceived,
  searchUsers,
  recommendProperty,
  removeRecommendation
} = require('../controllers/recommendations');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/received')
  .get(protect, getRecommendationsReceived);

router.route('/search-users')
  .get(protect, searchUsers);

router.route('/:propertyId/recommend')
  .post(protect, recommendProperty);

router.route('/received/:recommendationId')
  .delete(protect, removeRecommendation);

module.exports = router; 