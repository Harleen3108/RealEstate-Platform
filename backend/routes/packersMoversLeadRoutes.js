const express = require('express');
const router = express.Router();
const PackersMoversLead = require('../models/PackersMoversLead');
const Property = require('../models/Property');
const { protect, authorize, requireRole } = require('../middleware/authMiddleware');

/**
 * @desc    Create a new Packers & Movers lead
 * @route   POST /api/packers-movers/leads
 * @access  Public (no auth required - form submission)
 */
router.post('/leads', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      moveFrom,
      moveTo,
      moveDate,
      propertySize,
      serviceType,
      phone,
      listingId,
      listingTitle,
      listingPrice,
      platformName = 'RealEstatePlatform'
    } = req.body;

    // Validation
    if (!moveFrom || !moveTo || !moveDate || !propertySize || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: moveFrom, moveTo, moveDate, propertySize, phone' 
      });
    }

    // Create lead
    const lead = new PackersMoversLead({
      userId,
      userName,
      userEmail,
      moveFrom,
      moveTo,
      moveDate,
      propertySize,
      serviceType: serviceType || 'full_service',
      phone,
      listingId,
      listingTitle,
      listingPrice,
      platformName,
      source: 'packers_movers_integration'
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating Packers & Movers lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
});

/**
 * @desc    Get all Packers & Movers leads
 * @route   GET /api/packers-movers/leads
 * @access  Private (Admin/Agency only)
 */
router.get('/leads', protect, requireRole('admin', 'teamlead', 'agency'), async (req, res) => {
  try {
    const { moveFrom, moveTo, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};

    // Filter by location
    if (moveFrom) query.moveFrom = { $regex: moveFrom, $options: 'i' };
    if (moveTo) query.moveTo = { $regex: moveTo, $options: 'i' };

    // Filter by status
    if (status) query.status = status;

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const leads = await PackersMoversLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('listingId', 'title price location images');

    const totalLeads = await PackersMoversLead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total: totalLeads,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLeads / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

/**
 * @desc    Get user's own Packers & Movers leads
 * @route   GET /api/packers-movers/my-leads
 * @access  Private
 */
router.get('/my-leads', protect, async (req, res) => {
  try {
    const leads = await PackersMoversLead.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('listingId', 'title price location images');

    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching user leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

/**
 * @desc    Get lead by ID
 * @route   GET /api/packers-movers/leads/:id
 * @access  Private
 */
router.get('/leads/:id', protect, async (req, res) => {
  try {
    const lead = await PackersMoversLead.findById(req.params.id)
      .populate('listingId', 'title price location images')
      .populate('userId', 'name email phoneNumber');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message
    });
  }
});

/**
 * @desc    Update lead status
 * @route   PATCH /api/packers-movers/leads/:id
 * @access  Private (Admin/Agency)
 */
router.patch('/leads/:id', protect, requireRole('admin', 'teamlead', 'agency'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const lead = await PackersMoversLead.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message
    });
  }
});

/**
 * @desc    Get analytics/stats for Packers & Movers leads
 * @route   GET /api/packers-movers/stats
 * @access  Private (Admin/Agency)
 */
router.get('/stats', protect, requireRole('admin', 'teamlead', 'agency'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const totalLeads = await PackersMoversLead.countDocuments(dateFilter);
    const leads = await PackersMoversLead.find(dateFilter);

    // Calculate statistics
    const stats = {
      totalLeads,
      byStatus: {},
      byServiceType: {},
      byCity: {},
      topDestinations: {}
    };

    // Group by status
    leads.forEach(lead => {
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      stats.byServiceType[lead.serviceType] = (stats.byServiceType[lead.serviceType] || 0) + 1;
      stats.byCity[lead.moveFrom] = (stats.byCity[lead.moveFrom] || 0) + 1;
      stats.topDestinations[lead.moveTo] = (stats.topDestinations[lead.moveTo] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * @desc    Delete a lead (Admin only)
 * @route   DELETE /api/packers-movers/leads/:id
 * @access  Private (Admin)
 */
router.delete('/leads/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const lead = await PackersMoversLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message
    });
  }
});

module.exports = router;
