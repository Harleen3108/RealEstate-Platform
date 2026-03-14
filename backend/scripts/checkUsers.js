const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        const admin = await User.findOne({ email: 'admin@elitereal.com' });
        console.log('User Count:', count);
        console.log('Admin Exists:', !!admin);
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}
check();
