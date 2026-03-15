const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
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

// @desc    Get buyer's own enquiries
// @route   GET /api/leads/my-enquiries
router.get('/my-enquiries', protect, async (req, res) => {
    try {
        const leads = await Lead.find({ buyer: req.user._id })
            .populate('property', 'title price location images')
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

        // Notify Agency
        await Notification.create({
            recipient: agencyId,
            type: 'lead',
            title: 'New Lead Received',
            message: `${name || req.user.name} has enquired about your property.`,
            relatedId: lead._id
        });

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

            // Notify Agency (Self-notification or for other team members if applicable)
            await Notification.create({
                recipient: lead.agency,
                type: 'status',
                title: 'Lead Status Updated',
                message: `Lead for ${lead.name} moved to "${req.body.status}".`,
                relatedId: lead._id
            });

            res.json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update lead (Agency)
// @route   PATCH /api/leads/:id
router.patch('/:id', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            const { name, email, phone, propertyId, message, status } = req.body;
            lead.name = name || lead.name;
            lead.email = email || lead.email;
            lead.phone = phone || lead.phone;
            lead.property = propertyId || lead.property;
            lead.message = message || lead.message;
            lead.status = status || lead.status;
            
            const updatedLead = await lead.save();
            const populatedLead = await Lead.findById(updatedLead._id).populate('property', 'title');
            res.json(populatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete lead (Agency)
// @route   DELETE /api/leads/:id
router.delete('/:id', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            await lead.deleteOne();
            res.json({ message: 'Lead removed' });
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
