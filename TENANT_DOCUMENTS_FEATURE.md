# Tenant Documents Center - Feature Documentation

## Overview
The **Tenant Documents Center** is a comprehensive document management system for tenants to create, manage, and download rent receipts and rental lease agreements. This feature simplifies the process of generating professional documents for tenant-landlord relationships.

## Features

### 1. Rent Receipt Management
- **Create Rent Receipts**: Generate professional rent receipts for monthly rent payments
- **Auto-numbered**: Receipts are automatically numbered (RR-YYYYMM-00001 format)
- **Multiple Payment Methods**: Support for Bank Transfer, Cash, Cheque, Digital Payment, and Online
- **PDF Download**: Generate and download receipts as professional PDF documents
- **Payment Tracking**: Record payment details, transaction IDs, cheque numbers, etc.
- **Tax Documentation**: Can be used for tax purposes and payment records

### 2. Lease Agreement Management
- **Create Lease Agreements**: Draft comprehensive rental agreements with all terms
- **Flexible Terms**: Configure rent amount, deposit, maintenance charges, lease period
- **Policy Management**: Set pet policy, smoking policy, guest policy
- **Utilities Configuration**: Specify which utilities are included/excluded
- **Auto-calculations**: Automatic calculation of lease end date based on period
- **Status Tracking**: Track lease status (draft, active, expired, terminated)
- **PDF Generation**: Generate professional lease agreement PDFs

## Technical Implementation

### Backend Architecture

#### Models

##### LeaseAgreement Model
```javascript
- tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber
- landlordName, landlordEmail, landlordPhone, landlordAddress, landlordAadharNumber
- propertyId, propertyAddress, propertyType, bhk
- rentAmount, rentDueDate, depositAmount, maintenanceCharges
- leasePeriodMonths, startDate, endDate
- rentIncreasePercentage, increaseFrequencyMonths
- utilitiesIncluded, utilitiesNotIncluded
- noticePeriodMonths
- petPolicy, smokingPolicy, guestPolicy, additionalTerms
- Status tracking: draft, active, expired, terminated
- Document storage path for PDF files
```

##### RentReceipt Model
```javascript
- receiptNumber (auto-generated)
- receiptDate, receiptMonth
- tenantName, tenantEmail, tenantPhone, tenantAddress, tenantAadharNumber
- landlordName, landlordEmail, landlordPhone, landlordPAN, landlordAddress
- propertyAddress, propertyType
- Payment breakdown: rentAmount, maintenanceCharges, securityDeposit, parkingCharges, otherCharges
- totalAmount (auto-calculated)
- paymentMethod (Cash, Cheque, Bank Transfer, Digital Payment, Online)
- paymentDetails: chequeNumber, bankName, transactionId, reference
- Status: draft, issued, accepted, cancelled
- Document storage path
```

#### API Routes
All routes require authentication (`protect` middleware)

**Base URL**: `/api/tenant`

##### Lease Agreement Routes
```
POST   /lease                      - Create new lease agreement
GET    /lease/:id                  - Get specific lease agreement
GET    /leases                     - Get all lease agreements for user
PUT    /lease/:id                  - Update lease agreement
POST   /lease/:id/generate-pdf     - Generate PDF for lease
DELETE /lease/:id                  - Delete lease agreement
```

##### Rent Receipt Routes
```
POST   /rent-receipt               - Create new rent receipt
GET    /rent-receipt/:id           - Get specific rent receipt
GET    /rent-receipts              - Get all rent receipts for user
PUT    /rent-receipt/:id           - Update rent receipt
POST   /rent-receipt/:id/generate-pdf - Generate PDF for receipt
DELETE /rent-receipt/:id           - Delete rent receipt
```

#### PDF Generation Service
Located at: `backend/services/documentGeneration/DocumentGeneratorService.js`

**Functions**:
1. `generateRentReceiptPDF(receiptData)` - Generates professional rent receipt PDF
2. `generateLeaseAgreementPDF(leaseData)` - Generates lease agreement PDF

**Features**:
- Professional formatting with headers and sections
- Organized layout with clear information hierarchy
- Table-based payment breakdown for receipts
- Comprehensive lease terms and policies
- Signature lines for both parties
- Automatic directory creation for PDF storage

### Frontend Components

#### TenantDocuments.jsx (Main Page)
- Tab-based navigation between Rent Receipts and Lease Agreements
- Feature information cards
- Responsive layout

#### RentReceiptManager.jsx
- Form to create rent receipts with all necessary fields
- List view of all receipts with status badges
- Download PDF functionality
- Edit and delete operations
- Real-time feedback messages

#### LeaseAgreementManager.jsx
- Comprehensive form for creating lease agreements
- Multi-section form for better organization
- List view with lease status and validity dates
- PDF generation and download
- Full CRUD operations

#### Styling (TenantDocuments.css)
- Modern glassmorphism design
- Responsive grid layouts
- Smooth animations and transitions
- Color-coded status badges
- Mobile-optimized interface

## Usage Guide

### Creating a Rent Receipt
1. Navigate to `/tenant/documents`
2. Click on "Rent Receipts" tab
3. Click "Create Receipt" button
4. Fill in rent receipt form:
   - Tenant information
   - Landlord information
   - Property and payment details
5. Click "Create Receipt"
6. Receipt appears in list with option to download PDF

### Downloading Rent Receipt
1. Find the receipt in the list
2. Click the download icon (📥)
3. PDF opens in new tab and can be saved

### Creating a Lease Agreement
1. Navigate to `/tenant/documents`
2. Click on "Lease Agreements" tab
3. Click "Create Agreement" button
4. Fill in comprehensive form:
   - Tenant & landlord information
   - Property details
   - Rental terms and conditions
   - Policy preferences
5. Click "Create Agreement"
6. Agreement appears in list with status tracking

### Generating Lease Agreement PDF
1. Find the lease in the list
2. Click the download icon (📥)
3. Professional lease agreement PDF is generated and opens
4. Contains all terms, conditions, and signature lines

## Database Schema

### LeaseAgreement Collection Fields
```
_id              : ObjectId
tenantName       : String (required)
tenantEmail      : String (required)
tenantPhone      : String (required)
landlordName     : String (required)
rentAmount       : Number (required)
depositAmount    : Number (required)
leasePeriodMonths: Number (required)
startDate        : Date (required)
endDate          : Date (auto-calculated)
status           : String (enum: draft, active, expired, terminated)
documentPath     : String (PDF file path)
userId           : ObjectId (ref: User)
createdAt        : Date
updatedAt        : Date
```

### RentReceipt Collection Fields
```
_id              : ObjectId
receiptNumber    : String (auto-generated, unique)
receiptDate      : Date
tenantName       : String (required)
landlordName     : String (required)
propertyAddress  : String (required)
rentAmount       : Number (required)
totalAmount      : Number (auto-calculated)
paymentMethod    : String (enum: Cash, Cheque, Bank Transfer, etc.)
status           : String (enum: draft, issued, accepted, cancelled)
documentPath     : String (PDF file path)
userId           : ObjectId (ref: User)
createdAt        : Date
updatedAt        : Date
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install pdfkit
```

### 2. Create Upload Directories
```bash
mkdir -p ./uploads/receipts
mkdir -p ./uploads/agreements
```

### 3. Add Routes to Server
- Routes are already added in `server.js`
- Tenant routes are registered at `/api/tenant`

### 4. Database Migrations
- No migrations needed, MongoDB will create collections automatically
- Models are already defined

## API Request/Response Examples

### Create Rent Receipt
```bash
POST /api/tenant/rent-receipt
Content-Type: application/json
Authorization: Bearer {token}

{
  "tenantName": "John Doe",
  "tenantEmail": "john@example.com",
  "tenantPhone": "+91-9876543210",
  "landlordName": "Jane Smith",
  "landlordEmail": "jane@example.com",
  "landlordPhone": "+91-9876543211",
  "propertyAddress": "123 Main Street, Mumbai",
  "rentAmount": 50000,
  "maintenanceCharges": 5000,
  "paymentMethod": "Bank Transfer",
  "period": "April 2026"
}

Response:
{
  "message": "Rent receipt created",
  "receipt": {
    "_id": "507f1f77bcf86cd799439011",
    "receiptNumber": "RR-202604-00001",
    "status": "draft",
    ...
  }
}
```

### Create Lease Agreement
```bash
POST /api/tenant/lease
Content-Type: application/json
Authorization: Bearer {token}

{
  "tenantName": "John Doe",
  "landlordName": "Jane Smith",
  "propertyAddress": "123 Main Street, Mumbai",
  "rentAmount": 50000,
  "depositAmount": 150000,
  "leasePeriodMonths": 12,
  "startDate": "2026-04-01",
  "petPolicy": "Not Allowed",
  "smokingPolicy": "Not Allowed"
}

Response:
{
  "message": "Lease agreement created",
  "lease": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "draft",
    "endDate": "2027-04-01",
    ...
  }
}
```

### Generate PDF
```bash
POST /api/tenant/rent-receipt/{id}/generate-pdf
Authorization: Bearer {token}

Response:
{
  "message": "PDF generated successfully",
  "pdfPath": "/uploads/receipts/receipt-RR-202604-00001-1713180000000.pdf"
}
```

## Error Handling

The feature includes comprehensive error handling for:
- Missing required fields (400 Bad Request)
- Invalid document IDs (404 Not Found)
- PDF generation failures (500 Internal Server Error)
- Authentication failures (401 Unauthorized)

Error responses follow standard format:
```json
{
  "message": "Error description"
}
```

## Security Features

1. **Authentication Required**: All endpoints protected with JWT authentication
2. **User Isolation**: Users can only access their own documents
3. **Document Storage**: PDFs stored in secure backend directories
4. **Input Validation**: All inputs validated before database operations
5. **Authorization Checks**: Middleware ensures proper role-based access

## Performance Considerations

1. **PDF Generation**: PDFs generated on-demand to save storage
2. **Pagination Ready**: API structure supports future pagination for large document lists
3. **Indexing**: Database indexes on userId and status for efficient queries
4. **Caching**: PDF paths cached in document records to avoid regeneration

## Future Enhancements

1. **E-Signature Integration**: Support for digital signatures
2. **Email Delivery**: Auto-send documents via email
3. **Bulk Receipt Generation**: Generate multiple receipts in bulk
4. **Receipt Templates**: Custom receipt templates
5. **Document Archival**: Long-term storage and archival
6. **Integration with Banking**: Direct payment confirmation
7. **Multi-tenant Support**: Manage multiple properties
8. **Notification System**: Alerts for receipt due dates

## Troubleshooting

### PDF Not Generating
- Check if `/uploads/receipts` and `/uploads/agreements` directories exist
- Verify pdfkit is installed: `npm list pdfkit`
- Check server logs for error details

### Documents Not Loading
- Verify user is authenticated
- Check if MongoDB connection is active
- Verify user ID matches in authentication token

### Form Submission Issues
- Ensure all required fields are filled
- Check browser console for validation errors
- Verify API endpoint URLs are correct

## Testing

### Manual Testing Checklist
- [ ] Create rent receipt with all fields
- [ ] Generate and download receipt PDF
- [ ] Edit receipt and verify changes
- [ ] Delete receipt and verify removal
- [ ] Create lease agreement with complex terms
- [ ] Generate and download lease PDF
- [ ] Verify auto-calculated end date
- [ ] Test with different payment methods
- [ ] Verify status transitions
- [ ] Test responsive UI on mobile

## Support & Contribution

For issues, feature requests, or contributions, please contact the development team or create an issue in the repository.
