const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a rent receipt PDF
 * @param {Object} receiptData - Rent receipt details
 * @returns {string} Path to generated PDF
 */
async function generateRentReceiptPDF(receiptData) {
    return new Promise((resolve, reject) => {
        try {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '../../uploads/receipts');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `receipt-${receiptData.receiptNumber}-${Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, fileName);

            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('RENT RECEIPT', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Issued by: ' + receiptData.landlordName, { align: 'center' });
            doc.moveDown(1);

            // Receipt Details
            doc.fontSize(11).font('Helvetica-Bold').text('Receipt Details', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Receipt Number: ${receiptData.receiptNumber}`);
            doc.text(`Receipt Date: ${new Date(receiptData.receiptDate).toLocaleDateString('en-IN')}`);
            doc.text(`Rent Period: ${receiptData.period}`);
            doc.moveDown(0.5);

            // Landlord Section
            doc.fontSize(11).font('Helvetica-Bold').text('From (Landlord)', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${receiptData.landlordName}`);
            doc.text(`Address: ${receiptData.landlordAddress || 'Not provided'}`);
            doc.text(`Email: ${receiptData.landlordEmail}`);
            doc.text(`Phone: ${receiptData.landlordPhone}`);
            if (receiptData.landlordPAN) {
                doc.text(`PAN: ${receiptData.landlordPAN}`);
            }
            doc.moveDown(0.5);

            // Tenant Section
            doc.fontSize(11).font('Helvetica-Bold').text('To (Tenant)', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${receiptData.tenantName}`);
            doc.text(`Address: ${receiptData.tenantAddress || 'Not provided'}`);
            doc.text(`Email: ${receiptData.tenantEmail}`);
            doc.text(`Phone: ${receiptData.tenantPhone}`);
            if (receiptData.tenantAadharNumber) {
                doc.text(`Aadhaar: ${receiptData.tenantAadharNumber}`);
            }
            doc.moveDown(0.5);

            // Property Details
            doc.fontSize(11).font('Helvetica-Bold').text('Property Details', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Address: ${receiptData.propertyAddress}`);
            if (receiptData.propertyType) {
                doc.text(`Type: ${receiptData.propertyType}`);
            }
            doc.moveDown(0.5);

            // Payment Details Table
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Breakdown', { underline: true });
            doc.fontSize(10).font('Helvetica');
            
            const tableData = [
                ['Description', 'Amount (₹)'],
                [`Rent`, `₹${receiptData.rentAmount.toLocaleString('en-IN')}`],
            ];
            
            if (receiptData.maintenanceCharges > 0) {
                tableData.push([`Maintenance Charges`, `₹${receiptData.maintenanceCharges.toLocaleString('en-IN')}`]);
            }
            if (receiptData.parkingCharges > 0) {
                tableData.push([`Parking Charges`, `₹${receiptData.parkingCharges.toLocaleString('en-IN')}`]);
            }
            if (receiptData.otherCharges > 0) {
                tableData.push([`Other Charges`, `₹${receiptData.otherCharges.toLocaleString('en-IN')}`]);
            }
            
            tableData.push(['TOTAL AMOUNT', `₹${receiptData.totalAmount.toLocaleString('en-IN')}`]);

            drawTable(doc, tableData, 50, 450);
            doc.moveDown(3);

            // Payment Method
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Method', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Method: ${receiptData.paymentMethod}`);
            if (receiptData.paymentDetails?.transactionId) {
                doc.text(`Transaction ID: ${receiptData.paymentDetails.transactionId}`);
            }
            if (receiptData.paymentDetails?.chequeNumber) {
                doc.text(`Cheque Number: ${receiptData.paymentDetails.chequeNumber}`);
            }
            if (receiptData.paymentDetails?.reference) {
                doc.text(`Reference: ${receiptData.paymentDetails.reference}`);
            }
            doc.moveDown(1);

            // Status and terms
            if (receiptData.notes) {
                doc.fontSize(10).font('Helvetica').text(`Notes: ${receiptData.notes}`);
            }

            doc.moveDown(2);
            doc.fontSize(9).font('Helvetica').text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center' });
            doc.fontSize(9).text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

            // Finalize the PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve(path.join('/uploads/receipts', fileName));
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate a lease agreement PDF
 * @param {Object} leaseData - Lease agreement details
 * @returns {string} Path to generated PDF
 */
async function generateLeaseAgreementPDF(leaseData) {
    return new Promise((resolve, reject) => {
        try {
            const uploadsDir = path.join(__dirname, '../../uploads/agreements');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `lease-${leaseData._id || Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, fileName);

            const doc = new PDFDocument({
                size: 'A4',
                margin: 40
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(18).font('Helvetica-Bold').text('LEASE AGREEMENT', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Rental Lease Agreement', { align: 'center' });
            doc.moveDown(1);

            // Agreement Details
            const agreementDate = new Date();
            doc.fontSize(10).font('Helvetica');
            doc.text(`Agreement Date: ${agreementDate.toLocaleDateString('en-IN')}`);
            doc.text(`Effective From: ${new Date(leaseData.startDate).toLocaleDateString('en-IN')}`);
            doc.text(`Effective Till: ${new Date(leaseData.endDate).toLocaleDateString('en-IN')}`);
            doc.text(`Lease Period: ${leaseData.leasePeriodMonths} months`);
            doc.moveDown(1);

            // Landlord Section
            doc.fontSize(12).font('Helvetica-Bold').text('LANDLORD (LESSOR)');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${leaseData.landlordName}`);
            doc.text(`Address: ${leaseData.landlordAddress}`);
            doc.text(`Email: ${leaseData.landlordEmail}`);
            doc.text(`Phone: ${leaseData.landlordPhone}`);
            if (leaseData.landlordAadharNumber) {
                doc.text(`Aadhaar Number: ${leaseData.landlordAadharNumber}`);
            }
            doc.moveDown(0.8);

            // Tenant Section
            doc.fontSize(12).font('Helvetica-Bold').text('TENANT (LESSEE)');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${leaseData.tenantName}`);
            doc.text(`Address: ${leaseData.tenantAddress}`);
            doc.text(`Email: ${leaseData.tenantEmail}`);
            doc.text(`Phone: ${leaseData.tenantPhone}`);
            if (leaseData.tenantAadharNumber) {
                doc.text(`Aadhaar Number: ${leaseData.tenantAadharNumber}`);
            }
            doc.moveDown(0.8);

            // Property Details
            doc.fontSize(12).font('Helvetica-Bold').text('PROPERTY DETAILS');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Address: ${leaseData.propertyAddress}`);
            doc.text(`Type: ${leaseData.propertyType}`);
            if (leaseData.bhk) {
                doc.text(`Configuration: ${leaseData.bhk}`);
            }
            doc.moveDown(0.8);

            // Rental Terms
            doc.fontSize(12).font('Helvetica-Bold').text('RENTAL TERMS');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Monthly Rent: ₹${leaseData.rentAmount.toLocaleString('en-IN')}`);
            doc.text(`Rent Due Date: ${leaseData.rentDueDate}th of every month`);
            doc.text(`Security Deposit: ₹${leaseData.depositAmount.toLocaleString('en-IN')}`);
            if (leaseData.maintenanceCharges > 0) {
                doc.text(`Maintenance Charges: ₹${leaseData.maintenanceCharges.toLocaleString('en-IN')}`);
            }
            doc.moveDown(0.5);
            
            if (leaseData.rentIncreasePercentage > 0) {
                doc.text(`Annual Rent Increase: ${leaseData.rentIncreasePercentage}% after every ${leaseData.increaseFrequencyMonths} months`);
            }
            doc.moveDown(0.8);

            // Utilities
            if (leaseData.utilitiesIncluded && leaseData.utilitiesIncluded.length > 0) {
                doc.fontSize(11).font('Helvetica-Bold').text('Utilities Included');
                doc.fontSize(10).font('Helvetica');
                leaseData.utilitiesIncluded.forEach(util => {
                    doc.text(`• ${util}`);
                });
                doc.moveDown(0.5);
            }

            if (leaseData.utilitiesNotIncluded && leaseData.utilitiesNotIncluded.length > 0) {
                doc.fontSize(11).font('Helvetica-Bold').text('Utilities Not Included (Tenant\'s Responsibility)');
                doc.fontSize(10).font('Helvetica');
                leaseData.utilitiesNotIncluded.forEach(util => {
                    doc.text(`• ${util}`);
                });
                doc.moveDown(0.5);
            }

            // Policies
            doc.fontSize(11).font('Helvetica-Bold').text('POLICIES & TERMS');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Pet Policy: ${leaseData.petPolicy}`);
            doc.text(`Smoking Policy: ${leaseData.smokingPolicy}`);
            if (leaseData.guestPolicy) {
                doc.text(`Guest Policy: ${leaseData.guestPolicy}`);
            }
            doc.text(`Notice Period for Termination: ${leaseData.noticePeriodMonths} month(s)`);
            doc.moveDown(0.8);

            // Additional Terms
            if (leaseData.additionalTerms) {
                doc.fontSize(11).font('Helvetica-Bold').text('ADDITIONAL TERMS & CONDITIONS');
                doc.fontSize(9).font('Helvetica').text(leaseData.additionalTerms, { align: 'left' });
                doc.moveDown(0.8);
            }

            // Signature section
            doc.moveDown(2);
            doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES');
            doc.moveDown(1);
            
            doc.fontSize(10).font('Helvetica').text('Landlord Signature: ___________________');
            doc.text('Date: ___________________');
            doc.moveDown(1);
            
            doc.fontSize(10).font('Helvetica').text('Tenant Signature: ___________________');
            doc.text('Date: ___________________');
            doc.moveDown(2);

            doc.fontSize(8).font('Helvetica').text('This lease agreement is valid when signed by both parties.', { align: 'center' });

            doc.end();

            writeStream.on('finish', () => {
                resolve(path.join('/uploads/agreements', fileName));
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Helper function to draw a table on PDF
 */
function drawTable(doc, data, x, y) {
    const cellWidth = 180;
    const cellHeight = 25;
    let currentY = y;

    data.forEach((row, rowIndex) => {
        let currentX = x;
        if (rowIndex > 0 && rowIndex === data.length - 1) {
            doc.font('Helvetica-Bold');
        }
        
        row.forEach((cell, colIndex) => {
            doc.rect(currentX, currentY, cellWidth, cellHeight).stroke();
            doc.text(cell, currentX + 5, currentY + 5, {
                width: cellWidth - 10,
                align: colIndex === 0 ? 'left' : 'right'
            });
            currentX += cellWidth;
        });
        
        currentY += cellHeight;
        doc.font('Helvetica');
    });
}

module.exports = {
    generateRentReceiptPDF,
    generateLeaseAgreementPDF
};
