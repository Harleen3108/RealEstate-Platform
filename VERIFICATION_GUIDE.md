# Tenant Documents Feature - Verification Guide

## Step 1: Install Dependencies ✅

### Backend
```bash
cd backend
npm install pdfkit
```

**Verify installation:**
```bash
npm list pdfkit
```

Should show: `pdfkit@0.14.0` (or similar version)

---

## Step 2: Create Upload Directories ✅

### On Windows (PowerShell)
```powershell
mkdir uploads/receipts -Force
mkdir uploads/agreements -Force
```

### Verify directories created
```powershell
Get-Item uploads/receipts
Get-Item uploads/agreements
```

Should return directory info without errors.

---

## Step 3: Verify Backend Models ✅

### Check Models Exist
```powershell
# In backend folder
Test-Path models/LeaseAgreement.js
Test-Path models/RentReceipt.js
```

Both should return `True`

### Verify Model Contents
```powershell
Select-String -Path models/LeaseAgreement.js -Pattern "tenantName|rentAmount" | Select-Object -First 2
Select-String -Path models/RentReceipt.js -Pattern "receiptNumber|totalAmount" | Select-Object -First 2
```

Should show schema definitions.

---

## Step 4: Verify Backend Routes ✅

### Check Routes File Exists
```powershell
Test-Path routes/tenantRoutes.js
```

Should return `True`

### Verify Route Patterns
```powershell
Select-String -Path routes/tenantRoutes.js -Pattern "router.post|router.get|router.delete" | Measure-Object
```

Should show approximately 10+ route definitions.

### Verify Routes Registered in Server
```powershell
Select-String -Path server.js -Pattern "tenantRoutes"
```

Should show:
```
const tenantRoutes = require('./routes/tenantRoutes');
app.use('/api/tenant', tenantRoutes);
```

---

## Step 5: Verify PDF Generation Service ✅

### Check Service Exists
```powershell
Test-Path services/documentGeneration/DocumentGeneratorService.js
```

Should return `True`

### Verify Functions Exported
```powershell
Select-String -Path services/documentGeneration/DocumentGeneratorService.js -Pattern "generateRentReceiptPDF|generateLeaseAgreementPDF|module.exports"
```

Should show both functions are defined and exported.

---

## Step 6: Verify Frontend Components ✅

### Check Component Files Exist
```powershell
cd ../frontend
Test-Path src/pages/TenantDocuments.jsx
Test-Path src/components/tenant/RentReceiptManager.jsx
Test-Path src/components/tenant/LeaseAgreementManager.jsx
Test-Path src/styles/TenantDocuments.css
```

All should return `True`

### Verify Imports in Components
```powershell
Select-String -Path src/pages/TenantDocuments.jsx -Pattern "RentReceiptManager|LeaseAgreementManager"
```

Should show both imports present.

---

## Step 7: Verify Frontend Routes ✅

### Check Route Added
```powershell
Select-String -Path src/App.jsx -Pattern "TenantDocuments|/tenant/documents"
```

Should show:
```
import TenantDocuments from './pages/TenantDocuments';
<Route path="/tenant/documents" element={<TenantDocuments />} />
```

---

## Step 8: Start Backend Server 🚀

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: [host]
```

**Verify:**
- No error messages
- Port 5000 accessible

---

## Step 9: Start Frontend Server 🚀

### In new terminal
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5174
```

---

## Step 10: API Testing with Postman/Thunder Client 📝

### Test 1: Create Rent Receipt

**Endpoint:** `POST http://localhost:5000/api/tenant/rent-receipt`

**Headers:**
```
Authorization: Bearer {YOUR_JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "tenantName": "John Doe",
  "tenantEmail": "john@example.com",
  "tenantPhone": "+91-9876543210",
  "tenantAddress": "123 Test Street",
  "landlordName": "Jane Smith",
  "landlordEmail": "jane@example.com",
  "landlordPhone": "+91-9876543211",
  "landlordAddress": "456 Owner Lane",
  "propertyAddress": "123 Test Street, Mumbai",
  "propertyType": "Apartment",
  "rentAmount": 50000,
  "maintenanceCharges": 5000,
  "paymentMethod": "Bank Transfer",
  "period": "2026-04",
  "receiptMonth": "April 2026",
  "notes": "Rent paid for April 2026"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Rent receipt created",
  "receipt": {
    "_id": "...",
    "receiptNumber": "RR-202604-00001",
    "status": "draft",
    "totalAmount": 55000,
    ...
  }
}
```

---

### Test 2: Get All Rent Receipts

**Endpoint:** `GET http://localhost:5000/api/tenant/rent-receipts`

**Headers:**
```
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response (200 OK):**
```json
[
  {
    "_id": "...",
    "receiptNumber": "RR-202604-00001",
    "tenantName": "John Doe",
    "rentAmount": 50000,
    ...
  }
]
```

---

### Test 3: Generate Receipt PDF

**Endpoint:** `POST http://localhost:5000/api/tenant/rent-receipt/{receipt_id}/generate-pdf`

**Headers:**
```
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response (200 OK):**
```json
{
  "message": "PDF generated successfully",
  "pdfPath": "/uploads/receipts/receipt-RR-202604-00001-1713200000000.pdf"
}
```

**Verify:** Check if file exists in `backend/uploads/receipts/`

---

### Test 4: Create Lease Agreement

**Endpoint:** `POST http://localhost:5000/api/tenant/lease`

**Headers:**
```
Authorization: Bearer {YOUR_JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "tenantName": "John Doe",
  "tenantEmail": "john@example.com",
  "tenantPhone": "+91-9876543210",
  "tenantAddress": "123 Test Street",
  "tenantAadharNumber": "1234 5678 9101",
  "landlordName": "Jane Smith",
  "landlordEmail": "jane@example.com",
  "landlordPhone": "+91-9876543211",
  "landlordAddress": "456 Owner Lane",
  "landlordAadharNumber": "9876 5432 1098",
  "propertyAddress": "123 Test Street, Mumbai",
  "propertyType": "Apartment",
  "bhk": "2BHK",
  "rentAmount": 50000,
  "rentDueDate": 1,
  "depositAmount": 150000,
  "maintenanceCharges": 5000,
  "leasePeriodMonths": 12,
  "startDate": "2026-04-01",
  "petPolicy": "Not Allowed",
  "smokingPolicy": "Not Allowed"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Lease agreement created",
  "lease": {
    "_id": "...",
    "status": "draft",
    "startDate": "2026-04-01",
    "endDate": "2027-04-01",
    "rentAmount": 50000,
    ...
  }
}
```

---

### Test 5: Generate Lease PDF

**Endpoint:** `POST http://localhost:5000/api/tenant/lease/{lease_id}/generate-pdf`

**Headers:**
```
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response (200 OK):**
```json
{
  "message": "PDF generated successfully",
  "pdfPath": "/uploads/agreements/lease-{id}.pdf"
}
```

**Verify:** Check if file exists in `backend/uploads/agreements/`

---

## Step 11: Frontend Testing 🎨

### Navigate to Feature
```
http://localhost:5174/tenant/documents
```

### Test Checklist

#### Initial Load
- [ ] Page loads without errors
- [ ] Two tabs visible: "Rent Receipts" and "Lease Agreements"
- [ ] Feature info cards display below
- [ ] Empty state message shows "No rent receipts yet"

#### Rent Receipts Tab
- [ ] Click "Create Receipt" button
- [ ] Form appears with all input fields
- [ ] Can fill in form fields
- [ ] Can submit form
- [ ] Receipt appears in list after creation
- [ ] Can see receipt number, period, tenant name
- [ ] Status badge shows "draft"
- [ ] Download button (📥) is visible
- [ ] Can click download to generate PDF
- [ ] PDF opens in new tab
- [ ] Can delete receipt using trash icon

#### Lease Agreements Tab
- [ ] Click "Create Agreement" button
- [ ] Form appears with multiple sections
- [ ] Can fill in all form fields
- [ ] Form has proper validation (required fields)
- [ ] Can submit form
- [ ] Lease appears in list after creation
- [ ] Shows property address, tenant name, amount
- [ ] Status badge shows status
- [ ] Valid date range displays correctly
- [ ] Download button generates PDF
- [ ] Can manage multiple leases

#### Responsive Design
- [ ] Resize browser window
- [ ] Layout adapts properly on tablet size
- [ ] Mobile view shows single column
- [ ] All buttons remain accessible
- [ ] Forms remain usable on mobile

---

## Step 12: PDF Quality Check 📄

### Download Generated PDFs

#### Rent Receipt PDF Should:
- [ ] Have "RENT RECEIPT" header
- [ ] Show receipt number and date
- [ ] Display landlord information
- [ ] Display tenant information
- [ ] Show property details
- [ ] Have payment breakdown table
- [ ] Show total amount
- [ ] Display payment method
- [ ] Be properly formatted

#### Lease Agreement PDF Should:
- [ ] Have "LEASE AGREEMENT" header
- [ ] Show effective dates
- [ ] Display landlord information
- [ ] Display tenant information
- [ ] Show property details
- [ ] Display rental terms (amount, due date, deposit)
- [ ] Show utilities included/excluded
- [ ] Display policies (pet, smoking, guest)
- [ ] Have signature lines for both parties
- [ ] Be clearly readable and professional

---

## Step 13: Database Verification 🗄️

### Connect to MongoDB
```bash
mongosh  # or mongo
use your_database_name
```

### Check Collections Created
```javascript
db.leaseagreements.count()
db.rentreceipts.count()
```

Should return number of documents created during testing.

### View Sample Documents
```javascript
db.leaseagreements.findOne()
db.rentreceipts.findOne()
```

Should show document structure matches schema.

---

## Step 14: Error Testing 🚨

### Test Missing Required Fields

**Endpoint:** `POST http://localhost:5000/api/tenant/rent-receipt`

**Body (missing landlordName):**
```json
{
  "tenantName": "John Doe",
  "propertyAddress": "123 Street",
  "rentAmount": 50000
}
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Missing required fields"
}
```

### Test Unauthorized Access

**Endpoint:** `GET http://localhost:5000/api/tenant/rent-receipts`

**Without Authorization header:**

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Not authorized to access this route"
}
```

### Test Invalid Document ID

**Endpoint:** `GET http://localhost:5000/api/tenant/rent-receipt/invalid123`

**Expected Response (500 or 404):**
```json
{
  "message": "Rent receipt not found"
}
```

---

## Step 15: Performance Verification ⚡

### Check Response Times
- [ ] Receipt creation: < 500ms
- [ ] Lease creation: < 500ms
- [ ] Fetch all receipts: < 1s
- [ ] PDF generation: < 2s
- [ ] PDF download: immediate

### Check File Sizes
- [ ] Receipt PDF: 50-200 KB
- [ ] Lease PDF: 100-300 KB

### Verify No Memory Leaks
- [ ] Backend process memory stable
- [ ] Frontend remains responsive after multiple operations
- [ ] No console errors

---

## Step 16: Cross-Browser Testing 🌐

Test on multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if macOS)

Check:
- [ ] All features work
- [ ] Styling displays correctly
- [ ] PDFs generate properly
- [ ] No console errors

---

## Step 17: Final Checklist ✨

### Backend
- [ ] All 10+ API routes working
- [ ] Database operations successful
- [ ] PDF generation functional
- [ ] Error handling proper
- [ ] Authentication working

### Frontend
- [ ] Both components render correctly
- [ ] Forms validate and submit
- [ ] Data displays in lists
- [ ] PDF downloads work
- [ ] Responsive design works
- [ ] No console errors

### Database
- [ ] Collections created
- [ ] Documents stored correctly
- [ ] Document structure valid
- [ ] Indexes work properly

### Documentation
- [ ] Feature documented
- [ ] API endpoints listed
- [ ] Usage guide complete
- [ ] Troubleshooting section helpful

---

## Verification Summary

### Quick Verification Script (PowerShell)

```powershell
# Backend checks
Write-Host "=== BACKEND VERIFICATION ===" -ForegroundColor Green
Test-Path backend/models/LeaseAgreement.js | Write-Host "✓ LeaseAgreement model"
Test-Path backend/models/RentReceipt.js | Write-Host "✓ RentReceipt model"
Test-Path backend/routes/tenantRoutes.js | Write-Host "✓ Tenant routes"
Test-Path backend/services/documentGeneration/DocumentGeneratorService.js | Write-Host "✓ PDF service"
Test-Path backend/uploads/receipts | Write-Host "✓ Receipts directory"
Test-Path backend/uploads/agreements | Write-Host "✓ Agreements directory"

# Frontend checks
Write-Host "`n=== FRONTEND VERIFICATION ===" -ForegroundColor Green
Test-Path frontend/src/pages/TenantDocuments.jsx | Write-Host "✓ TenantDocuments page"
Test-Path frontend/src/components/tenant/RentReceiptManager.jsx | Write-Host "✓ RentReceiptManager"
Test-Path frontend/src/components/tenant/LeaseAgreementManager.jsx | Write-Host "✓ LeaseAgreementManager"
Test-Path frontend/src/styles/TenantDocuments.css | Write-Host "✓ Styles"

Write-Host "`n=== ALL CHECKS COMPLETE ===" -ForegroundColor Cyan
```

---

## If Something Fails 🔧

### Backend Not Starting?
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### PDFs Not Generating?
```bash
# Check directories exist
mkdir -p uploads/receipts
mkdir -p uploads/agreements

# Check permissions
ls -la uploads/
```

### Frontend Not Loading?
```bash
# Clear cache and restart
rm -r .next node_modules
npm install
npm run dev
```

### Database Connected But No Data?
```javascript
// Check MongoDB connection
db.version()

// Create test document
db.rentreceipts.insertOne({
  tenantName: "Test",
  rentAmount: 50000,
  totalAmount: 50000
})
```

---

Done! Follow this guide to verify all components are working correctly. Let me know if you hit any issues! 🚀
