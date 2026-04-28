const mongoose = require('mongoose');

const packersMoversLeadSchema = new mongoose.Schema({
  // User information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  userName: { 
    type: String 
  },
  userEmail: { 
    type: String 
  },
  
  // Moving details
  moveFrom: { 
    type: String, 
    required: true 
  },
  moveTo: { 
    type: String, 
    required: true 
  },
  moveDate: { 
    type: Date,
    required: true 
  },
  propertySize: { 
    type: String,
    required: true,
    enum: ['1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'office']
  },
  serviceType: { 
    type: String,
    required: true,
    enum: ['full_service', 'transport_only', 'storage']
  },
  phone: { 
    type: String,
    required: true 
  },
  
  // Associated property (if available)
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  listingTitle: {
    type: String
  },
  listingPrice: {
    type: Number
  },
  
  // Tracking
  source: { 
    type: String, 
    default: 'packers_movers_integration'
  },
  platformName: { 
    type: String,
    default: 'RealEstatePlatform'
  },
  
  // Lead routing status
  redirectedToNoBroker: { 
    type: Boolean, 
    default: false 
  },
  nobrokerUrl: {
    type: String
  },
  
  // Lead status
  status: {
    type: String,
    enum: ['new', 'contacted', 'completed', 'cancelled'],
    default: 'new'
  },
  notes: {
    type: String
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Index for faster queries
packersMoversLeadSchema.index({ userId: 1, createdAt: -1 });
packersMoversLeadSchema.index({ moveFrom: 1, moveTo: 1 });
packersMoversLeadSchema.index({ createdAt: -1 });
packersMoversLeadSchema.index({ phone: 1 });

module.exports = mongoose.model('PackersMoversLead', packersMoversLeadSchema);
