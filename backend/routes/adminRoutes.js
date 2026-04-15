const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');
const { protect, authorize, requireRole } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

// @desc    Delete a property listing
// @route   DELETE /api/admin/properties/:id
router.delete('/properties/:id', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Delete associated image files
        if (property.images && property.images.length > 0) {
            property.images.forEach(imgUrl => {
                if (imgUrl.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '..', imgUrl);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            });
        }

        await property.deleteOne();
        res.json({ message: 'Property removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get global stats
// @route   GET /api/admin/stats
router.get('/stats', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments();
        const totalAgencies = await User.countDocuments({ role: 'agency' });
        const totalInvestors = await User.countDocuments({ role: 'investor' });
        const totalLeads = await Lead.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'buyer' });
        
        // Dynamic financial metrics
        const propertyValues = await Property.aggregate([
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const totalInvestedValue = propertyValues.length > 0 ? propertyValues[0].total : 0;
        
        const activeListings = await Property.countDocuments({ status: 'Available' });
        const pendingAgencies = await User.countDocuments({ role: 'agency', isApproved: false });
        
        // Mocked revenue for dashboard realism
        const totalRevenue = totalInvestedValue * 0.01; // 1% management fee estimate

        res.json({
            totalProperties,
            totalAgencies,
            totalInvestors,
            totalLeads,
            totalUsers,
            totalInvestedValue,
            activeListings,
            pendingAgencies,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get lead analytics for admin dashboard
// @route   GET /api/admin/lead-analytics
router.get('/lead-analytics', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();
        
        // Status counts for Summary Stats
        const contactedLeads = await Lead.countDocuments({ 
            status: { $in: ['Contacted', 'Site Visit', 'Negotiation'] } 
        });
        const closedLeads = await Lead.countDocuments({ 
            status: { $in: ['Booked', 'Sold', 'Closed'] } 
        });
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

        // Source Performance
        const sourcePerformance = await Lead.aggregate([
            { $group: { _id: "$source", count: { $sum: 1 } } }
        ]);

        // Volume Trend (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const volumeTrend = await Lead.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            summary: {
                totalLeads,
                contactedLeads,
                closedLeads,
                conversionRate: `${conversionRate}%`
            },
            sourcePerformance,
            volumeTrend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all users for management
// @route   GET /api/admin/users
router.get('/users', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user approval status (e.g. for Agencies)
// @route   PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = req.body.isApproved;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// @desc    Create an Agency account directly
// @route   POST /api/admin/agencies
router.post('/agencies', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role: 'agency', 
            isApproved: true, // Admin-created agencies are auto-approved
            phoneNumber 
        });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            phoneNumber: user.phoneNumber
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', protect, requireRole('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete Admin accounts via this route' });
            }
            // Optional: Delete related properties if they are an agency
            if (user.role === 'agency') {
                await Property.deleteMany({ agency: user._id });
            }
            await user.deleteOne();
            res.json({ message: 'User and associated data removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle user block status
// @route   PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    const { isBlocked } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block Admins' });

        user.isBlocked = isBlocked;
        await user.save();

        // Notify User
        await Notification.create({
            recipient: user._id,
            type: 'alert',
            title: isBlocked ? 'Account Blocked' : 'Account Unblocked',
            message: isBlocked ? 'Your account has been blocked by the admin.' : 'Your account has been unblocked by the admin.',
        });

        res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get comprehensive user profile (profile + history + saved)
// @route   GET /api/admin/users/:id/details
router.get('/users/:id/details', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('savedProperties');
            
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get leads/enquiries sent by this user
        const enquiries = await Lead.find({ email: user.email }).populate('property');

        // Get investments if user is an investor
        let investorData = null;
        if (user.role === 'investor') {
            const investments = await Investment.find({ investor: user._id });
            investorData = { investments };
        }

        let agencyData = null;
        if (user.role === 'Agency') {
            const properties = await Property.find({ agency: user._id });
            agencyData = { properties };
        }

        res.json({
            user,
            enquiries,
            savedProperties: user.savedProperties,
            agencyData,
            investorData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve a property listing
// @route   PATCH /api/admin/properties/:id/approve
router.patch('/properties/:id/approve', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Notify Agency
        await Notification.create({
            recipient: property.agency,
            type: 'system',
            title: 'Property Approved',
            message: `Your property "${property.title}" has been approved by the admin.`,
            relatedId: property._id
        });

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle block status of a property
// @route   PATCH /api/admin/properties/:id/block
router.patch('/properties/:id/block', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const newStatus = property.status === 'Blocked' ? 'Available' : 'Blocked';
        const isBlocking = newStatus === 'Blocked';
        
        property.status = newStatus;
        await property.save();

        // Notify Agency
        await Notification.create({
            recipient: property.agency,
            type: 'alert',
            title: isBlocking ? 'Property Blocked' : 'Property Reactivated',
            message: isBlocking ? `Your property "${property.title}" has been blocked by the admin.` : `Your property "${property.title}" is now available.`,
            relatedId: property._id
        });

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle flag status of a lead
// @route   PATCH /api/admin/leads/:id/flag
router.patch('/leads/:id/flag', protect, requireRole('admin', 'teamlead'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        lead.isFlagged = !lead.isFlagged;
        await lead.save();

        // Notify Agency
        const title = lead.isFlagged ? 'Lead Flagged for Review' : 'Lead Review Resolved';
        const message = lead.isFlagged 
            ? `Admin has flagged the lead "${lead.name}" for suspicious activity. Please handle with caution.` 
            : `The review flag on lead "${lead.name}" has been removed.`;
            
        await Notification.create({
            recipient: lead.agency,
            type: lead.isFlagged ? 'alert' : 'system',
            title: title,
            message: message,
            relatedId: lead._id
        });

        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
