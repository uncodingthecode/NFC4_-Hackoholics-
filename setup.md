# Setup Guide - Fix npm i and npm run dev Issues

## Step 1: Create Environment Files

### Backend Environment (.env file in backend directory)
Create a file named `.env` in the `backend` directory with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017
DB_NAME=thadomal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRY=7d

# Cloudinary Configuration (optional for now)
CLOUDINARY_CLOUNDNAME=your_cloudinary_cloud_name
CLOUDINARY_APIKEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI (optional for now)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=8000
NODE_ENV=development
```

### Frontend Environment (.env.local file in frontend directory)
Create a file named `.env.local` in the `frontend` directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 3: Start MongoDB (if not already running)
Make sure MongoDB is running on your system. If you don't have MongoDB installed:

1. Download and install MongoDB Community Server
2. Start the MongoDB service
3. Or use MongoDB Atlas (cloud) and update the MONGO_URI in your .env file

## Step 4: Run the Applications

### Backend
```bash
cd backend
npm run dev
```

### Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

## Common Issues and Solutions

### Issue 1: "Module not found" errors
- Delete `node_modules` and `package-lock.json` in both directories
- Run `npm install` again

### Issue 2: MongoDB connection errors
- Make sure MongoDB is running
- Check if the MONGO_URI is correct in your .env file

### Issue 3: Port already in use
- Change the PORT in backend .env file to 8001 or another available port
- Update the frontend .env.local accordingly

### Issue 4: Missing API keys
- For now, you can use placeholder values for Cloudinary and Gemini API keys
- The app will work without these services, but some features won't be available

## Optional: Get API Keys for Full Functionality

### Google Gemini AI
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your backend .env file

### Cloudinary
1. Go to https://cloudinary.com/
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Add them to your backend .env file

## Testing the Setup

1. Backend should start on http://localhost:8000
2. Frontend should start on http://localhost:3000
3. You should see "MongoDB connected" in the backend console
4. You should be able to access the frontend application

If you encounter any specific error messages, please share them and I can help troubleshoot further. 