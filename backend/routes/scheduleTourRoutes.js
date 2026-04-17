const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const TourBooking = require('../models/TourBooking');
const Notification = require('../models/Notification');

const buildTourPayload = (body = {}) => ({
  propertyId: body.propertyId,
  name: body.name,
  email: body.email,
  phone: body.phone,
  date: body.date,
  time: body.time,
  message: body.message || '',
});

router.post('/', async (req, res) => {
  try {
    const payload = buildTourPayload(req.body);

    if (!payload.propertyId || !payload.name || !payload.email || !payload.phone || !payload.date || !payload.time) {
      return res.status(400).json({ message: 'propertyId, name, email, phone, date, and time are required' });
    }

    const property = await Property.findById(payload.propertyId).populate('agency', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const booking = await TourBooking.create({
      property: property._id,
      user: req.user?._id,
      agency: property.agency?._id || property.agency,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      date: payload.date,
      time: payload.time,
      message: payload.message,
      source: req.user ? 'Authenticated' : 'Guest',
    });

    if (property.agency?._id || property.agency) {
      await Notification.create({
        recipient: property.agency._id || property.agency,
        type: 'system',
        title: 'New Tour Request',
        message: `${payload.name} requested a tour for ${property.title} on ${payload.date} at ${payload.time}.`,
        relatedId: booking._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tour scheduled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
