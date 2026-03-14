const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all properties
// @route   GET /api/properties
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find({}).populate('agency', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get properties by agency
// @route   GET /api/properties/agency/:agencyId
router.get('/agency/:agencyId', async (req, res) => {
    try {
        const properties = await Property.find({ agency: req.params.agencyId }).populate('agency', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get property by ID
// @route   GET /api/properties/:id
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('agency', 'name email');
        if (property) {
            res.json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private/Agency
router.post('/', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        let agencyId;
        
        if (req.user.role === 'Admin') {
            if (!req.body.agency) {
                return res.status(400).json({ message: 'Please select a responsible agency for this listing' });
            }
            agencyId = req.body.agency;
        } else {
            agencyId = req.user._id;
        }
        
        const property = new Property({
            ...req.body,
            agency: agencyId,
            isApproved: req.user.role === 'Admin' ? true : false // Auto-approve admin listings
        });
        const createdProperty = await property.save();
        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private/Agency
router.put('/:id', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (property) {
            if (property.agency.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to update this property' });
            }
            Object.assign(property, req.body);
            const updatedProperty = await property.save();
            res.json(updatedProperty);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private/Agency
router.delete('/:id', protect, authorize('Agency', 'Admin'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (property) {
            if (property.agency.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized to delete this property' });
            }
            await property.deleteOne();
            res.json({ message: 'Property removed' });
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
