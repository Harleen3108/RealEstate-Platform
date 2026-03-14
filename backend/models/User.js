const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Agency', 'Investor', 'Buyer'], 
        default: 'Buyer' 
    },
    phoneNumber: { type: String },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    isApproved: { type: Boolean, default: false }, // For Agencies
    isBlocked: { type: Boolean, default: false } // Admin can block users
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
