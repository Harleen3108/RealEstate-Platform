const express = require('express');
const router = express.Router();
const EMICalculatorService = require('../services/estimation/EMICalculator');

/**
 * @desc    Calculate EMI
 * @route   POST /api/calculators/emi
 * @access  Public
 * @body    { principalAmount, annualInterestRate, loanYears }
 */
router.post('/emi', (req, res) => {
    try {
        const { principalAmount, annualInterestRate, loanYears } = req.body;

        if (!principalAmount || annualInterestRate === undefined || !loanYears) {
            return res.status(400).json({ 
                message: 'Missing required fields: principalAmount, annualInterestRate, loanYears' 
            });
        }

        const result = EMICalculatorService.calculateEMI(
            principalAmount,
            annualInterestRate,
            loanYears
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @desc    Get EMI Amortization Schedule
 * @route   POST /api/calculators/emi/schedule
 * @access  Public
 * @body    { principalAmount, annualInterestRate, loanYears }
 */
router.post('/emi/schedule', (req, res) => {
    try {
        const { principalAmount, annualInterestRate, loanYears } = req.body;

        if (!principalAmount || annualInterestRate === undefined || !loanYears) {
            return res.status(400).json({ 
                message: 'Missing required fields: principalAmount, annualInterestRate, loanYears' 
            });
        }

        const result = EMICalculatorService.getAmortizationSchedule(
            principalAmount,
            annualInterestRate,
            loanYears
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @desc    Calculate Affordable Loan Amount
 * @route   POST /api/calculators/emi/affordable
 * @access  Public
 * @body    { monthlyBudget, annualInterestRate, loanYears }
 */
router.post('/emi/affordable', (req, res) => {
    try {
        const { monthlyBudget, annualInterestRate, loanYears } = req.body;

        if (!monthlyBudget || annualInterestRate === undefined || !loanYears) {
            return res.status(400).json({ 
                message: 'Missing required fields: monthlyBudget, annualInterestRate, loanYears' 
            });
        }

        const affordableLoan = EMICalculatorService.calculateAffordableLoan(
            monthlyBudget,
            annualInterestRate,
            loanYears
        );

        res.json({ 
            monthlyBudget: parseFloat(monthlyBudget),
            annualInterestRate: parseFloat(annualInterestRate),
            loanTerm: parseFloat(loanYears),
            affordableLoanAmount: affordableLoan
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
