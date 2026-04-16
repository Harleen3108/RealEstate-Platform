const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');

dotenv.config();

const agencyId = "69b3deee13f8273880e92fe0";

const properties = [
    {
        title: "Modern Skyline Apartment",
        description: "Experience luxury living in the heart of the city with breathtaking views of the skyline. This apartment features top-tier finishes and modern amenities.",
        location: "Gurugram, Sector 45",
        propertyType: "Apartment",
        price: 12500000,
        size: 1800,
        bedrooms: 3,
        bathrooms: 3,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1935&auto=format&fit=crop"],
        amenities: ["Gym", "Pool", "24/7 Security"]
    },
    {
        title: "Majestic Villa with Garden",
        description: "A spacious villa surrounded by lush greenery. Perfect for families looking for a quiet yet luxurious lifestyle.",
        location: "South Delhi, GK-II",
        propertyType: "Villa",
        price: 85000000,
        size: 4500,
        bedrooms: 5,
        bathrooms: 6,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"],
        amenities: ["Private Garden", "Home Theater", "Smart Home Docs"]
    },
    {
        title: "Tech-Hub Commercial Space",
        description: "Prime commercial office space located in the most sought-after tech corridor. Ideal for startups and established enterprises.",
        location: "Noida, Sector 62",
        propertyType: "Commercial",
        price: 25000000,
        size: 3200,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"],
        amenities: ["Fiber Internet", "Conference Rooms", "Parking"]
    },
    {
        title: "Serene Riverside Land",
        description: "Huge plot of land by the river, perfect for building a custom vacation home or a boutique resort.",
        location: "Rishikesh, Tapovan",
        propertyType: "Land",
        price: 15000000,
        size: 10000,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"],
        amenities: ["River View", "Road Connectivity"]
    },
    {
        title: "Compact Studio Apartment",
        description: "A cozy studio apartment designed for efficient living. Ideal for young professionals.",
        location: "Mumbai, Bandra West",
        propertyType: "Apartment",
        price: 9500000,
        size: 650,
        bedrooms: 1,
        bathrooms: 1,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["Fully Furnished", "High-speed Elevators"]
    },
    {
        title: "Elite Golf Course Villa",
        description: "Luxury villa overlooking the signature golf course. Experience tranquility and luxury in one place.",
        location: "Gurugram, DLF Phase 5",
        propertyType: "Villa",
        price: 120000000,
        size: 6000,
        bedrooms: 6,
        bathrooms: 7,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["Golf View", "Private Pool", "Wine Cellar"]
    },
    {
        title: "Retail Shop Frontage",
        description: "High-visibility retail space on the ground floor of a premium mall. Captive audience and great footfall.",
        location: "Chandigarh, Sector 17",
        propertyType: "Commercial",
        price: 45000000,
        size: 1500,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["HVAC", "Grand Entry"]
    },
    {
        title: "Mountain Retreat Land",
        description: "Beautiful sloped land in the mountains with a clear view of the Himalayas. Great for a luxury homestay.",
        location: "Manali, Old Manali",
        propertyType: "Land",
        price: 8000000,
        size: 5000,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=1887&auto=format&fit=crop"],
        amenities: ["Pine Views", "Electricity Connection"]
    },
    {
        title: "Penthouse at The Heights",
        description: "The ultimate expression of luxury. A dual-level penthouse with private terrace and panoramic city views.",
        location: "Gurugram, Sector 66",
        propertyType: "Apartment",
        price: 45000000,
        size: 4200,
        bedrooms: 4,
        bathrooms: 5,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop"],
        amenities: ["Private Lift", "Terrace Garden", "Club Membership"]
    },
    {
        title: "Mediterranean Style Villa",
        description: "Exquisite Mediterranean architecture meeting modern comforts. A true masterpiece for those who value art.",
        location: "Goa, Anjuna",
        propertyType: "Villa",
        price: 65000000,
        size: 3800,
        bedrooms: 4,
        bathrooms: 4,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop"],
        amenities: ["Beach Access", "Outdoor Kitchen", "Saltwater Pool"]
    },
    {
        title: "Premium PG Accommodation",
        description: "Fully furnished premium PG in the heart of the city. Perfect for young professionals and students. Includes meals, WiFi, and housekeeping.",
        location: "Bangalore, Koramangala",
        propertyType: "PG",
        price: 30000,
        size: 200,
        bedrooms: 1,
        bathrooms: 1,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1935&auto=format&fit=crop"],
        amenities: ["WiFi", "AC", "Meal Plan", "24/7 Security", "Laundry"]
    },
    {
        title: "Co-Living Space Mumbai",
        description: "Modern co-living space with shared common areas, high-speed WiFi, and a vibrant community. Ideal for professionals seeking work-life balance.",
        location: "Mumbai, Lower Parel",
        propertyType: "CoLiving",
        price: 45000,
        size: 350,
        bedrooms: 1,
        bathrooms: 1,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["Coworking Space", "WiFi", "Community Events", "Gym Access", "Furnished"]
    },
    {
        title: "Executive PG Delhi",
        description: "Luxurious PG offering private rooms with ensuite bathrooms. Located near metro with easy access to business hubs.",
        location: "Delhi, Connaught Place",
        propertyType: "PG",
        price: 50000,
        size: 250,
        bedrooms: 1,
        bathrooms: 1,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1567096282100-97dca221d746?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["Private Bathroom", "WiFi", "Fitness Center", "24/7 Security", "Library"]
    },
    {
        title: "Co-Living Hub Gurugram",
        description: "Vibrant co-living community with state-of-the-art facilities. Features rooftop garden, co-working spaces, and recreational areas.",
        location: "Gurugram, Sector 43",
        propertyType: "CoLiving",
        price: 55000,
        size: 400,
        bedrooms: 1,
        bathrooms: 1,
        agency: agencyId,
        isApproved: true,
        images: ["https://images.unsplash.com/photo-1586665053330-d181e51a339c?q=80&w=2070&auto=format&fit=crop"],
        amenities: ["Rooftop Garden", "Coworking", "Swimming Pool", "Community Manager", "Furnished"]
    }
];

const seedProperties = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        await Property.insertMany(properties);
        console.log('15 properties seeded successfully!');
        
        process.exit();
    } catch (error) {
        console.error('Error seeding properties:', error);
        process.exit(1);
    }
};

seedProperties();
