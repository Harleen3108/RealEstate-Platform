const express = require('express');
const router = express.Router();
const LeaseAgreement = require('../models/LeaseAgreement');
const RentReceipt = require('../models/RentReceipt');
const { protect, authorize } = require('../middleware/authMiddleware');
// const { generateRentReceiptPDF, generateLeaseAgreementPDF } = require('../services/documentGeneration/DocumentGeneratorService');

// ============================================
// LEASE AGREEMENT ROUTES
// ============================================

// POST /api/tenant/lease - Create new lease agreement
router.post('/lease', protect, async (req, res) => {
    try {
        const {
            tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber,
            landlordName, landlordEmail, landlordPhone, landlordAddress, landlordAadharNumber,
            propertyAddress, propertyType, bhk,
            rentAmount, rentDueDate, depositAmount, maintenanceCharges, leasePeriodMonths,
            startDate, endDate, rentIncreasePercentage, increaseFrequencyMonths,
            utilitiesIncluded, utilitiesNotIncluded, noticePeriodMonths,
            petPolicy, smokingPolicy, guestPolicy, additionalTerms, propertyId
        } = req.body;

        // Validate required fields
        if (!tenantName || !landlordName || !propertyAddress || !rentAmount || !depositAmount || !leasePeriodMonths || !startDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const lease = new LeaseAgreement({
            tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber,
            landlordName, landlordEmail, landlordPhone, landlordAddress, landlordAadharNumber,
            propertyAddress, propertyType, bhk,
            rentAmount, rentDueDate, depositAmount, maintenanceCharges, leasePeriodMonths,
            startDate, endDate, rentIncreasePercentage, increaseFrequencyMonths,
            utilitiesIncluded, utilitiesNotIncluded, noticePeriodMonths,
            petPolicy, smokingPolicy, guestPolicy, additionalTerms, propertyId,
            userId: req.user._id
        });

        await lease.save();
        res.status(201).json({ message: 'Lease agreement created', lease });
    } catch (error) {
        console.error('Error creating lease:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/tenant/lease/:id - Get lease agreement
router.get('/lease/:id', protect, async (req, res) => {
    try {
        const lease = await LeaseAgreement.findById(req.params.id);
        if (!lease) {
            return res.status(404).json({ message: 'Lease agreement not found' });
        }
        res.json(lease);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/tenant/leases - Get all lease agreements for user
router.get('/leases', protect, async (req, res) => {
    try {
        const leases = await LeaseAgreement.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(leases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/tenant/lease/:id - Update lease agreement
router.put('/lease/:id', protect, async (req, res) => {
    try {
        const lease = await LeaseAgreement.findById(req.params.id);
        if (!lease) {
            return res.status(404).json({ message: 'Lease agreement not found' });
        }

        // Update fields
        Object.assign(lease, req.body);
        await lease.save();

        res.json({ message: 'Lease agreement updated', lease });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/tenant/lease/:id/generate-pdf - Generate PDF for lease
router.post('/lease/:id/generate-pdf', protect, async (req, res) => {
    try {
        const lease = await LeaseAgreement.findById(req.params.id);
        if (!lease) {
            return res.status(404).json({ message: 'Lease agreement not found' });
        }

        // TODO: Generate PDF when pdfkit dependency is fixed
        // const pdfPath = await generateLeaseAgreementPDF(lease);
        // lease.documentPath = pdfPath;
        // await lease.save();

        res.json({ message: 'PDF generation coming soon', pdfPath: '/documents/sample.pdf' });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// RENT RECEIPT ROUTES
// ============================================

// POST /api/tenant/rent-receipt - Create new rent receipt
router.post('/rent-receipt', protect, async (req, res) => {
    try {
        const {
            tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber,
            landlordName, landlordEmail, landlordPhone, landlordPAN, landlordAddress,
            propertyAddress, propertyType,
            rentAmount, maintenanceCharges, securityDeposit, parkingCharges, otherCharges,
            paymentMethod, paymentDetails, period, receiptMonth, leaseAgreementId, notes,
            termsAndConditions
        } = req.body;

        // Validate required fields
        if (!tenantName || !landlordName || !propertyAddress || !rentAmount || !period) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const receipt = new RentReceipt({
            tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber,
            landlordName, landlordEmail, landlordPhone, landlordPAN, landlordAddress,
            propertyAddress, propertyType,
            rentAmount, maintenanceCharges, securityDeposit, parkingCharges, otherCharges,
            paymentMethod, paymentDetails, period, receiptMonth: receiptMonth || period,
            leaseAgreementId, notes, termsAndConditions,
            userId: req.user._id
        });

        await receipt.save();
        res.status(201).json({ message: 'Rent receipt created', receipt });
    } catch (error) {
        console.error('Error creating rent receipt:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/tenant/rent-receipt/:id - Get rent receipt
router.get('/rent-receipt/:id', protect, async (req, res) => {
    try {
        const receipt = await RentReceipt.findById(req.params.id);
        if (!receipt) {
            return res.status(404).json({ message: 'Rent receipt not found' });
        }
        res.json(receipt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/tenant/rent-receipts - Get all rent receipts for user
router.get('/rent-receipts', protect, async (req, res) => {
    try {
        const receipts = await RentReceipt.find({ userId: req.user._id }).sort({ receiptDate: -1 });
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/tenant/rent-receipt/:id - Update rent receipt
router.put('/rent-receipt/:id', protect, async (req, res) => {
    try {
        const receipt = await RentReceipt.findById(req.params.id);
        if (!receipt) {
            return res.status(404).json({ message: 'Rent receipt not found' });
        }

        Object.assign(receipt, req.body);
        await receipt.save();

        res.json({ message: 'Rent receipt updated', receipt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/tenant/rent-receipt/:id/generate-pdf - Generate PDF for receipt
router.post('/rent-receipt/:id/generate-pdf', protect, async (req, res) => {
    try {
        const receipt = await RentReceipt.findById(req.params.id);
        if (!receipt) {
            return res.status(404).json({ message: 'Rent receipt not found' });
        }
// TODO: Generate PDF when pdfkit dependency is fixed
        // const pdfPath = await generateRentReceiptPDF(receipt);
        // receipt.documentPath = pdfPath;
        // receipt.status = 'issued';
        // await receipt.save();

        res.json({ message: 'PDF generation coming soon', pdfPath: '/documents/sample.pdf' });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/tenant/rent-receipt/:id - Delete rent receipt
router.delete('/rent-receipt/:id', protect, async (req, res) => {
    try {
        const receipt = await RentReceipt.findByIdAndDelete(req.params.id);
        if (!receipt) {
            return res.status(404).json({ message: 'Rent receipt not found' });
        }
        res.json({ message: 'Rent receipt deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/tenant/lease/:id - Delete lease agreement
router.delete('/lease/:id', protect, async (req, res) => {
    try {
        const lease = await LeaseAgreement.findByIdAndDelete(req.params.id);
        if (!lease) {
            return res.status(404).json({ message: 'Lease agreement not found' });
        }
        res.json({ message: 'Lease agreement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
