const express = require('express');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} = require('../controllers/favorites');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getFavorites);

router.route('/:propertyId')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

router.route('/:propertyId/check')
  .get(protect, checkFavorite);

module.exports = router; 