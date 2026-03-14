const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all investments for logged in investor
// @route   GET /api/investments
router.get('/', protect, authorize('Investor', 'Admin'), async (req, res) => {
    try {
        const query = req.user.role === 'Admin' ? {} : { investor: req.user._id };
        const investments = await Investment.find(query);
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a new investment record
// @route   POST /api/investments
router.post('/', protect, authorize('Investor', 'Admin'), async (req, res) => {
    try {
        const investment = new Investment({
            ...req.body,
            investor: req.user._id
        });
        const createdInvestment = await investment.save();
        res.status(201).json(createdInvestment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update investment record
// @route   PUT /api/investments/:id
router.put('/:id', protect, authorize('Investor', 'Admin'), async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);
        if (investment) {
            if (investment.investor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            Object.assign(investment, req.body);
            const updatedInvestment = await investment.save();
            res.json(updatedInvestment);
        } else {
            res.status(404).json({ message: 'Investment not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete investment record
// @route   DELETE /api/investments/:id
router.delete('/:id', protect, authorize('Investor', 'Admin'), async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);
        if (investment) {
            if (investment.investor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            await investment.deleteOne();
            res.json({ message: 'Investment record removed' });
        } else {
            res.status(404).json({ message: 'Investment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
