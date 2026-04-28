const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Lead = require('../models/Lead');
const User = require('../models/User');
const Property = require('../models/Property');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate';

const demoRows = [
  {
    name: 'Ritika Malhotra',
    email: 'ritika.malhotra@example.com',
    phone: '9876500011',
    message: 'Need complete onboarding and payment plan details.',
    status: 'Negotiation',
    source: 'Direct',
    paymentDetails: {
      purposeOrScopeOfWork: 'Luxury apartment purchase + legal documentation',
      onboardingDate: new Date(),
      totalProjectValue: 2500000,
      advanceReceived: 500000,
      advanceDate: new Date(),
      finalPayment: 0,
      finalPaymentDate: null,
      status: 'Active'
    }
  },
  {
    name: 'Karan Desai',
    email: 'karan.desai@example.com',
    phone: '9876500022',
    message: 'Interested in investor onboarding package.',
    status: 'Booked',
    source: 'Organic Search',
    paymentDetails: {
      purposeOrScopeOfWork: 'Investor onboarding + portfolio consultation',
      onboardingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalProjectValue: 1800000,
      advanceReceived: 900000,
      advanceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      finalPayment: 300000,
      finalPaymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'Active'
    }
  },
  {
    name: 'Anjali Rao',
    email: 'anjali.rao@example.com',
    phone: '9876500033',
    message: 'Requesting final closure and completion tracking.',
    status: 'Closed',
    source: 'Facebook Ads',
    paymentDetails: {
      purposeOrScopeOfWork: 'Full property closing and documentation support',
      onboardingDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      totalProjectValue: 3200000,
      advanceReceived: 1200000,
      advanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      finalPayment: 2000000,
      finalPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'Complete'
    }
  }
];

async function seedOnboardingTrackerData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 30000 });
    console.log('Connected:', mongoose.connection.host);

    const agency = await User.findOne({ role: /agency/i });
    const property = await Property.findOne();

    if (!agency || !property) {
      console.log('Missing required seed prerequisites. Need at least 1 agency user and 1 property.');
      process.exit(1);
    }

    const leadsToInsert = demoRows.map((row) => ({
      property: property._id,
      agency: agency._id,
      ...row
    }));

    const inserted = await Lead.insertMany(leadsToInsert);
    console.log(`Inserted ${inserted.length} onboarding tracker leads.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding onboarding tracker data failed:', err.message || err);
    process.exit(1);
  }
}

seedOnboardingTrackerData();
