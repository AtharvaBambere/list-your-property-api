const User = require('../models/User');
const Property = require('../models/Property');




exports.getRecommendationsReceived = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'recommendationsReceived.property',
        select: 'propertyId price bedrooms bathrooms propertyType location squareFootage description images status'
      })
      .populate({
        path: 'recommendationsReceived.from',
        select: 'name email'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.recommendationsReceived.length,
      data: user.recommendationsReceived
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email to search for'
      });
    }

    
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('name email');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.recommendProperty = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a user to recommend to'
      });
    }

    
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    
    const recipientUser = await User.findById(userId);

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        error: 'Recipient user not found'
      });
    }

    
    const existingRecommendation = recipientUser.recommendationsReceived.find(
      rec => 
        rec.property.toString() === req.params.propertyId && 
        rec.from.toString() === req.user.id
    );

    if (existingRecommendation) {
      return res.status(400).json({
        success: false,
        error: 'You have already recommended this property to this user'
      });
    }

    
    recipientUser.recommendationsReceived.push({
      property: req.params.propertyId,
      from: req.user.id,
      createdAt: Date.now()
    });

    await recipientUser.save();

    res.status(200).json({
      success: true,
      data: {
        message: `Property successfully recommended to ${recipientUser.name}`
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.removeRecommendation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    
    const recommendation = user.recommendationsReceived.id(req.params.recommendationId);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }

    
    recommendation.remove();
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