const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Property = require('../models/Property');

const modelUrls = [
  '/models/house-modern.gltf',
  '/models/villa-luxe.gltf',
  '/models/penthouse-glass.gltf',
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const properties = await Property.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id title location threeDModelUrl');

    if (!properties.length) {
      console.log('No approved properties found to assign models.');
      process.exit(0);
    }

    const results = [];
    for (let i = 0; i < properties.length; i += 1) {
      const property = properties[i];
      const model = modelUrls[i % modelUrls.length];

      property.threeDModelUrl = model;
      await property.save();

      results.push({
        id: property._id.toString(),
        title: property.title,
        location: property.location,
        model,
      });
    }

    console.log('Assigned 3D models to properties:');
    results.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.title} (${r.location})`);
      console.log(`   id: ${r.id}`);
      console.log(`   model: ${r.model}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Failed to assign 3D models:', error.message);
    process.exit(1);
  }
}

run();
