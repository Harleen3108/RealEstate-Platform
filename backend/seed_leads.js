const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const User = require('./models/User');
const Property = require('./models/Property');

const seedLeads = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/real-estate'); // Adjust URL if needed
        console.log('Connected to MongoDB');

        const user = await User.findOne({ role: 'Buyer' });
        const agency = await User.findOne({ role: 'Agency' });
        const property = await Property.findOne();

        if (!user || !agency || !property) {
            console.log('Missing data to seed leads. Please ensure you have a buyer, an agency, and a property.');
            process.exit(1);
        }

        const sources = ['Zillow Premium', 'Realtor.com', 'Facebook Ads', 'Organic Search', 'Direct'];
        const statuses = ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Sold', 'Lost', 'Closed'];

        const mockLeads = [];
        for (let i = 0; i < 20; i++) {
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

            mockLeads.push({
                property: property._id,
                buyer: user._id,
                agency: agency._id,
                name: `Test Lead ${i}`,
                email: `test${i}@example.com`,
                phone: '1234567890',
                message: 'I am interested in this property',
                status: statuses[Math.floor(Math.random() * statuses.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                createdAt: createdAt
            });
        }

        await Lead.deleteMany({});
        await Lead.insertMany(mockLeads);
        console.log('Successfully seeded 20 mock leads.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding leads:', error);
        process.exit(1);
    }
};

seedLeads();
