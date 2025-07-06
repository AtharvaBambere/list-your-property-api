const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  areaSqFt: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi'],
    default: 'Unfurnished'
  },
  availableFrom: {
    type: Date
  },
  listedBy: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  colorTheme: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  listingType: {
    type: String,
    enum: ['rent', 'sale'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


PropertySchema.index({ 
  'title': 'text', 
  'city': 'text', 
  'state': 'text',
  'type': 'text',
  'tags': 'text'
});

PropertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema);