const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function checkProps() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const titles = ['Dream City', 'Cantt County', 'Defence Colony', 'Maneshak Colony'];
        const props = await Property.find({ title: { $in: titles } });
        props.forEach(p => {
            console.log(JSON.stringify({ title: p.title, images: p.images }));
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProps();
