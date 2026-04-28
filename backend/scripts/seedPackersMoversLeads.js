const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const PackersMoversLead = require('../models/PackersMoversLead');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate';

const demoLeads = [
  {
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@example.com',
    moveFrom: 'Mumbai',
    moveTo: 'Pune',
    moveDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    propertySize: '2bhk',
    serviceType: 'full_service',
    phone: '9876543210',
    listingTitle: '2 BHK for family',
    listingPrice: 4500000,
    status: 'new',
    notes: 'Demo lead: interested in full-service move.'
  },
  {
    userName: 'Neha Verma',
    userEmail: 'neha.verma@example.com',
    moveFrom: 'Bengaluru',
    moveTo: 'Hyderabad',
    moveDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    propertySize: '3bhk',
    serviceType: 'transport_only',
    phone: '9123456780',
    listingTitle: '3 BHK near Koramangala',
    listingPrice: 7800000,
    status: 'contacted',
    notes: 'Requested quote and availability.'
  },
  {
    userName: 'Rohan Mehta',
    userEmail: 'rohan.mehta@example.com',
    moveFrom: 'Delhi',
    moveTo: 'Gurgaon',
    moveDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    propertySize: '1bhk',
    serviceType: 'storage',
    phone: '9988776655',
    listingTitle: '1 BHK studio',
    listingPrice: 2200000,
    status: 'completed',
    notes: 'Completed move, payment pending.'
  },
  {
    userName: 'Priya Nair',
    userEmail: 'priya.nair@example.com',
    moveFrom: 'Chennai',
    moveTo: 'Coimbatore',
    moveDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    propertySize: '4bhk',
    serviceType: 'full_service',
    phone: '9012345678',
    listingTitle: 'Villa with garden',
    listingPrice: 12500000,
    status: 'cancelled',
    notes: 'Customer cancelled due to schedule conflict.'
  }
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 30000 });
    console.log('Connected:', mongoose.connection.host || MONGO);

    // Insert demo leads without removing existing data
    const inserted = await PackersMoversLead.insertMany(demoLeads);
    console.log(`Inserted ${inserted.length} demo packers-movers leads.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
};

seed();
