const mongoose = require('mongoose');

const tourBookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    source: {
      type: String,
      enum: ['Guest', 'Authenticated'],
      default: 'Guest',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TourBooking', tourBookingSchema);
