const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@elitereal.com';
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('Exists.');
            process.exit(0);
        }

        const pass = Math.random().toString(36).slice(-8);
        const admin = new User({
            name: 'Admin',
            email: email,
            password: pass,
            role: 'Admin',
            isApproved: true
        });

        await admin.save();
        console.log('CREATED');
        console.log('Email:', email);
        console.log('Pass:', pass);
        process.exit(0);
    } catch (err) {
        console.error('FAIL:', err.message);
        process.exit(1);
    }
}
run();
