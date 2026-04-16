/**
 * EMI Calculator Service
 * Calculates Equated Monthly Installment for home loans
 */

class EMICalculatorService {
    /**
     * Calculate EMI (Equated Monthly Installment)
     * Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
     * where:
     * P = Principal (Loan Amount)
     * r = Monthly Interest Rate (Annual Rate / 12 / 100)
     * n = Number of Months (Years * 12)
     */
    static calculateEMI(principalAmount, annualInterestRate, loanYears) {
        const principal = parseFloat(principalAmount);
        const rate = parseFloat(annualInterestRate);
        const years = parseFloat(loanYears);

        if (principal <= 0 || rate < 0 || years <= 0) {
            throw new Error('Invalid input: Principal and years must be positive, rate must be non-negative');
        }

        const monthlyRate = rate / 12 / 100;
        const numberOfMonths = years * 12;

        let emi;
        if (monthlyRate === 0) {
            // If rate is 0, simple division
            emi = principal / numberOfMonths;
        } else {
            const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths);
            const denominator = Math.pow(1 + monthlyRate, numberOfMonths) - 1;
            emi = numerator / denominator;
        }

        const totalAmount = emi * numberOfMonths;
        const totalInterest = totalAmount - principal;

        return {
            monthlyEMI: Math.round(emi * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            principal: Math.round(principal * 100) / 100,
            interestRate: rate,
            loanTerm: years,
            numberOfMonths: numberOfMonths
        };
    }

    /**
     * Get amortization schedule (month-by-month breakdown)
     */
    static getAmortizationSchedule(principalAmount, annualInterestRate, loanYears) {
        const emiData = this.calculateEMI(principalAmount, annualInterestRate, loanYears);
        const monthlyRate = annualInterestRate / 12 / 100;
        const emi = emiData.monthlyEMI;

        let remainingBalance = principalAmount;
        const schedule = [];

        for (let month = 1; month <= emiData.numberOfMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = emi - interestPayment;
            remainingBalance -= principalPayment;

            schedule.push({
                month,
                payment: Math.round(emi * 100) / 100,
                principal: Math.round(principalPayment * 100) / 100,
                interest: Math.round(interestPayment * 100) / 100,
                balance: Math.round(Math.max(0, remainingBalance) * 100) / 100
            });
        }

        return {
            ...emiData,
            schedule
        };
    }

    /**
     * Calculate affordable loan amount based on monthly budget
     */
    static calculateAffordableLoan(monthlyBudget, annualInterestRate, loanYears) {
        const monthlyBudgetAmount = parseFloat(monthlyBudget);
        const rate = parseFloat(annualInterestRate);
        const years = parseFloat(loanYears);

        if (monthlyBudgetAmount <= 0 || rate < 0 || years <= 0) {
            throw new Error('Invalid input');
        }

        const monthlyRate = rate / 12 / 100;
        const numberOfMonths = years * 12;

        let principal;
        if (monthlyRate === 0) {
            principal = monthlyBudgetAmount * numberOfMonths;
        } else {
            const denominator = (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));
            principal = monthlyBudgetAmount * denominator;
        }

        return Math.round(principal * 100) / 100;
    }
}

module.exports = EMICalculatorService;
