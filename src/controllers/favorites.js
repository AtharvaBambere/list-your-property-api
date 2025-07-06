const User = require('../models/User');
const Property = require('../models/Property');




exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.addFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    
    if (user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        success: false,
        error: 'Property already in favorites'
      });
    }

    
    user.favorites.push(req.params.propertyId);
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    
    if (!user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        success: false,
        error: 'Property not in favorites'
      });
    }

    
    user.favorites = user.favorites.filter(
      favorite => favorite.toString() !== req.params.propertyId
    );
    
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.checkFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isFavorite = user.favorites.includes(req.params.propertyId);

    res.status(200).json({
      success: true,
      data: {
        isFavorite
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}; 