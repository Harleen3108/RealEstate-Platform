# 🚀 Real Estate Platform - Setup Guide

## Prerequisites Fixed ✅

All dependency issues have been resolved:

- ✅ **Backend OpenAI Module** - Installed
- ✅ **Frontend Dependencies** - Installed (vite, react, etc.)
- ✅ **Environment Files** - Created

---

## Critical Setup: MongoDB Connection

### Option 1: Using MongoDB Atlas (Cloud - Recommended) ☁️

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Create a free account** and sign up
3. **Create a cluster** (free tier available)
4. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Drivers" → Node.js
   - Copy the connection string
5. **Update `.env` file** in `backend/`:
   ```
   MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/realestate?retryWrites=true&w=majority
   ```

### Option 2: Using Local MongoDB 🖥️

1. **Install MongoDB Community Edition**:
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Mac: `brew tap mongodb/brew && brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB**:
   ```bash
   # Windows (PowerShell as Admin)
   mongod
   
   # Mac/Linux
   brew services start mongodb-community
   ```

3. **Verify connection**:
   ```bash
   mongo  # or mongosh on newer versions
   ```

---

## Environment Files Created ✅

### Backend: `backend/.env`
```
MONGO_URI=mongodb://localhost:27017/realestate
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this
SCRAPING_ENABLED=false
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

### Frontend: `frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_BACKEND_URL=http://localhost:5001
```

---

## Running the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

**Expected output when MongoDB is running:**
```
MongoDB Connected: localhost:27017
Server running on port 5001
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Quick Troubleshooting

### ❌ "Cannot find module 'openai'"
✅ **Fixed** - Ran `npm install openai`

### ❌ "vite is not recognized"
✅ **Fixed** - Ran `npm install` in frontend directory

### ❌ "MONGO_URI must be a string, got 'undefined'"
✅ **Fixed** - Created `.env` file with MONGO_URI

### ❌ "MongoDB connection failed"
**Action Required**: Set up MongoDB (Atlas or Local)

### ❌ "Port 5001 already in use"
**Solution**:
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

---

## Port Configuration

- **Backend API**: http://localhost:5001
- **Frontend App**: http://localhost:5173
- **MongoDB Local**: mongodb://localhost:27017

---

## Next Steps

1. **Set up MongoDB** (Atlas or Local)
2. **Update `MONGO_URI`** in `backend/.env`
3. **Start backend**: `npm run dev` (from backend folder)
4. **Start frontend**: `npm run dev` (from frontend folder)
5. **Seed data**: `node scripts/seedArticles.js` (from backend folder)
6. **Access app**: http://localhost:5173

---

## API Endpoints (Once Running)

- Articles: `GET /api/articles`
- Properties: `GET /api/properties`
- Auth: `GET /api/auth/...`
- And more!

---

## Commands Reference

```bash
# Backend
npm install              # Install dependencies
npm run dev             # Start with nodemon
npm run seed            # Seed initial data
npm run seedArticles    # Seed articles

# Frontend
npm install             # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
```

---

Created: April 15, 2026
Status: ✅ Ready to Run
