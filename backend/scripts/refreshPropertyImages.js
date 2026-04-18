const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Property = require('../models/Property');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const IMAGE_POOL = {
    Apartment: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    Villa: [
        'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/53610/large-home-residential-house-architecture-53610.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    Commercial: [
        'https://images.pexels.com/photos/37347/office-sitting-room-executive-sitting.jpg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    Land: [
        'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/46160/field-clouds-sky-earth-46160.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    PG: [
        'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    CoLiving: [
        'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ],
    default: [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=1600',
        'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1600'
    ]
};

const getImagesForType = (type, indexSeed) => {
    const pool = IMAGE_POOL[type] || IMAGE_POOL.default;
    const start = indexSeed % pool.length;
    return [
        pool[start],
        pool[(start + 1) % pool.length],
        pool[(start + 2) % pool.length]
    ];
};

const refreshPropertyImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real-estate');
        console.log('Connected to MongoDB');

        const properties = await Property.find({});
        if (!properties.length) {
            console.log('No properties found to update');
            process.exit(0);
        }

        let updated = 0;
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            const freshImages = getImagesForType(property.propertyType, i);
            property.images = freshImages;
            await property.save();
            updated += 1;
        }

        console.log(`Updated images for ${updated} properties with reliable real-estate photos.`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to refresh property images:', error.message);
        process.exit(1);
    }
};

refreshPropertyImages();
