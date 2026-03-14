const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all leads (Agency only)
// @route   GET /api/leads
router.get('/', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { agency: req.user._id };
        const leads = await Lead.find(query)
            .populate('property', 'title price location')
            .populate('buyer', 'name email phoneNumber')
            .populate('agency', 'name email phoneNumber');
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new lead (Buyer)
// @route   POST /api/leads
router.post('/', protect, async (req, res) => {
    try {
        const { propertyId, agencyId, buyerId, name, email, phone, message, status, source } = req.body;
        
        const leadData = {
            property: propertyId,
            buyer: buyerId || (req.user.role !== 'Admin' ? req.user._id : null),
            agency: agencyId,
            name: name || req.user.name,
            email: email || req.user.email,
            phone: phone || req.user.phoneNumber,
            message,
            status: status || 'New Lead',
            source: source || 'Direct'
        };

        const lead = await Lead.create(leadData);
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update lead status (Agency)
// @route   PATCH /api/leads/:id/status
router.patch('/:id/status', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            lead.status = req.body.status;
            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
router.post('/:id/notes', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            lead.notes.push({ content: req.body.content });
            await lead.save();
            res.json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
