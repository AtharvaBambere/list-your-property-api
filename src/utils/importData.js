const fs = require('fs');
const csv = require('csv-parser');
const connectDB = require('../config/db');
const Property = require('../models/Property');
const User = require('../models/User');

const importCSVToMongoDB = async (csvFilePath) => {
  try {
    
    await connectDB();
    
    console.log('Connected to MongoDB. Starting import...');
    
    
    let adminUser = await User.findOne({ email: 'admin@property.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@property.com',
        password: 'password123'
      });
      console.log('Admin user created');
    }


    await Property.deleteMany({});
    console.log('Cleared existing properties');

    const results = [];
    let count = 0;

    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        console.log(`CSV parsing complete. Found ${results.length} records.`);
        
        
        for (const record of results) {
          try {
            
            const tags = record.tags ? record.tags.split(',').map(tag => tag.trim()) : [];
            
            
            const amenities = record.amenities ? record.amenities.split(',').map(amenity => amenity.trim()) : [];
            
            
            const availableFrom = record.availableFrom ? new Date(record.availableFrom) : null;
            
            
            const property = {
              propertyId: record.id || `PROP-${Date.now().toString().slice(-8)}-${count}`,
              title: record.title || 'No Title',
              type: record.type || 'Other',
              price: parseFloat(record.price || 0),
              state: record.state || '',
              city: record.city || '',
              areaSqFt: parseInt(record.areaSqFt || 0),
              bedrooms: parseInt(record.bedrooms || 0),
              bathrooms: parseInt(record.bathrooms || 0),
              amenities: amenities,
              furnished: record.furnished || 'Unfurnished',
              availableFrom: availableFrom,
              listedBy: record.listedBy || 'Unknown',
              tags: tags,
              colorTheme: record.colorTheme || '',
              rating: parseFloat(record.rating || 0),
              isVerified: record.isVerified === 'TRUE',
              listingType: record.listingType || 'rent',
              createdBy: adminUser._id
            };

            await Property.create(property);
            count++;
            
            if (count % 100 === 0) {
              console.log(`Imported ${count} properties...`);
            }
          } catch (error) {
            console.error(`Error importing property: ${error.message}`);
          }
        }
        
        console.log(`Import complete. Imported ${count} properties.`);
        process.exit(0);
      });
    
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};


const main = async () => {
  try {
    
    await importCSVToMongoDB('./data.csv');

  } catch (error) {
    console.error('Error in main function:', error.message);
    process.exit(1);
  }
};


main(); 