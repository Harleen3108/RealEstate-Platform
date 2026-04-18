const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: '64a1b2c3d4e5f6a7b8c9d0aa', role: 'Buyer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log(token);
