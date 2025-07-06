const Property = require('../models/Property');




exports.getProperties = async (req, res) => {
  try {
    
    const reqQuery = { ...req.query };

    
    const removeFields = ['select', 'sort', 'page', 'limit'];

    
    removeFields.forEach(param => delete reqQuery[param]);

    
    let queryStr = JSON.stringify(reqQuery);

    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    
    let query = Property.find(JSON.parse(queryStr));

    
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = {};
      if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
      query = query.find({ price: priceFilter });
    }

    
    if (req.query.minBedrooms) {
      query = query.find({ bedrooms: { $gte: Number(req.query.minBedrooms) } });
    }
    if (req.query.maxBedrooms) {
      query = query.find({ bedrooms: { $lte: Number(req.query.maxBedrooms) } });
    }
    if (req.query.minBathrooms) {
      query = query.find({ bathrooms: { $gte: Number(req.query.minBathrooms) } });
    }
    if (req.query.maxBathrooms) {
      query = query.find({ bathrooms: { $lte: Number(req.query.maxBathrooms) } });
    }

    
    if (req.query.minArea || req.query.maxArea) {
      const areaFilter = {};
      if (req.query.minArea) areaFilter.$gte = Number(req.query.minArea);
      if (req.query.maxArea) areaFilter.$lte = Number(req.query.maxArea);
      query = query.find({ areaSqFt: areaFilter });
    }

    
    if (req.query.type) {
      query = query.find({ type: req.query.type });
    }

    
    if (req.query.city) {
      query = query.find({ city: new RegExp(req.query.city, 'i') });
    }
    if (req.query.state) {
      query = query.find({ state: new RegExp(req.query.state, 'i') });
    }

    
    if (req.query.minRating) {
      query = query.find({ rating: { $gte: Number(req.query.minRating) } });
    }
    if (req.query.maxRating) {
      query = query.find({ rating: { $lte: Number(req.query.maxRating) } });
    }

    
    if (req.query.furnished) {
      query = query.find({ furnished: req.query.furnished });
    }

    
    if (req.query.isVerified) {
      const isVerified = req.query.isVerified === 'true';
      query = query.find({ isVerified });
    }

    
    if (req.query.listingType) {
      query = query.find({ listingType: req.query.listingType });
    }

    
    if (req.query.amenities) {
      const amenitiesArray = req.query.amenities.split('|');
      query = query.find({ amenities: { $all: amenitiesArray } });
    }

    
    if (req.query.tags) {
      const tagsArray = req.query.tags.split('|');
      query = query.find({ tags: { $all: tagsArray } });
    }

    
    if (req.query.availableFrom) {
      const date = new Date(req.query.availableFrom);
      query = query.find({ availableFrom: { $lte: date } });
    }

    
    if (req.query.listedBy) {
      query = query.find({ listedBy: req.query.listedBy });
    }

    
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Property.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    
    query = query.populate({
      path: 'createdBy',
      select: 'name email'
    });

    
    const properties = await query;

    
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      pagination,
      data: properties
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate({
      path: 'createdBy',
      select: 'name email'
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.createProperty = async (req, res) => {
  try {
    
    req.body.createdBy = req.user.id;

    
    if (!req.body.propertyId) {
      req.body.propertyId = `PROP-${Date.now().toString().slice(-8)}`;
    }

    
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split('|');
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split('|');
    }

    
    if (req.body.availableFrom && typeof req.body.availableFrom === 'string') {
      req.body.availableFrom = new Date(req.body.availableFrom);
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this property'
      });
    }

    
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split('|');
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split('|');
    }

    
    if (req.body.availableFrom && typeof req.body.availableFrom === 'string') {
      req.body.availableFrom = new Date(req.body.availableFrom);
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};




exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

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




exports.filterProperties = async (req, res) => {
  try {
    const {
      priceRange,
      bedroomCount,
      bathroomCount,
      furnished,
      propertyType,
      location,
      amenities,
      tags,
      rating,
      isVerified,
      listingType,
      listedBy,
      areaRange
    } = req.body;

    let query = {};

    
    if (priceRange) {
      query.price = {};
      if (priceRange.min) query.price.$gte = priceRange.min;
      if (priceRange.max) query.price.$lte = priceRange.max;
    }

    
    if (bedroomCount) {
      query.bedrooms = bedroomCount;
    }

    
    if (bathroomCount) {
      query.bathrooms = bathroomCount;
    }

    
    if (furnished) {
      query.furnished = furnished;
    }

    
    if (propertyType) {
      query.type = propertyType;
    }

    
    if (location) {
      if (location.city) query.city = new RegExp(location.city, 'i');
      if (location.state) query.state = new RegExp(location.state, 'i');
    }

    
    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    
    if (tags && tags.length > 0) {
      query.tags = { $all: tags };
    }

    
    if (rating) {
      query.rating = { $gte: rating };
    }

    
    if (isVerified !== undefined) {
      query.isVerified = isVerified;
    }

    
    if (listingType) {
      query.listingType = listingType;
    }

    
    if (listedBy) {
      query.listedBy = listedBy;
    }

    
    if (areaRange) {
      query.areaSqFt = {};
      if (areaRange.min) query.areaSqFt.$gte = areaRange.min;
      if (areaRange.max) query.areaSqFt.$lte = areaRange.max;
    }

    const properties = await Property.find(query).populate({
      path: 'createdBy',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};