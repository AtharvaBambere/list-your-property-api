const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');


exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    
    token = req.headers.authorization.split(' ')[1];
  }

  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found with this ID' 
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
};


exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};


exports.checkPropertyOwnership = async (req, res, next) => {
  try {
    const property = await require('../models/Property').findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update/delete this property'
      });
    }

    req.property = property;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 