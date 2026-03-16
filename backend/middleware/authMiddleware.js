const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../debug_temp_log.txt');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (req.user && req.user.isBlocked) {
                fs.appendFileSync(logFile, `[${new Date().toISOString()}] AUTH FAILED: User ${decoded.id} is blocked\n`);
                return res.status(403).json({ message: 'Your account has been restricted by administration' });
            }
            next();
        } catch (error) {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] AUTH FAILED: Token error ${error.message}\n`);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] AUTH FAILED: No token provided at ${req.originalUrl}\n`);
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
