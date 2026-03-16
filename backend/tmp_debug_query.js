
const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const agencyId = '69b7858eded58f92d52b6d12';
        console.log('Testing query for agencyId:', agencyId);
        
        const properties = await Property.find({ agency: agencyId }).populate('agency', 'name email');
        console.log('Found properties:', properties.length);
        
        process.exit(0);
    } catch (error) {
        console.error('ERROR IN TEST SCRIPT:', error);
        process.exit(1);
    }
};

test();
