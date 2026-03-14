const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const leadRoutes = require('./routes/leadRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const path = require('path');
const upload = require('./middleware/uploadMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);

// File Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

app.get('/', (req, res) => {
    res.send('Real Estate Platform API is running...');
});

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(`Error: ${err.message}`);
        console.error('CRITICAL: Check your MongoDB Atlas IP Whitelist (allow 0.0.0.0/0 for testing).');
        process.exit(1);
    }
};

connectDB();
