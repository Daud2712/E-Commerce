# Environment Setup Guide

**Last Updated:** December 17, 2025  
**Repository:** https://github.com/Daud2712/E-Commerce  
**Latest Commit:** 0d335c4

This guide explains how to run the E-Commerce application in both local development and production environments.

## Table of Contents
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Initial Setup
```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd E-Commerce

# Install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## Local Development

### 1. Backend Setup

```bash
cd backend

# Copy environment example
cp .env.example .env

# Edit .env with your local settings
# Make sure to set:
# - PORT=5002
# - FRONTEND_URL=http://localhost:5173,http://localhost:5174
# - MONGO_URI=your_mongodb_connection_string
# - JWT_SECRET=your_secret_key

# Start backend server
npm run dev
```

The backend will run on http://localhost:5002

### 2. Frontend Setup

```bash
cd frontend

# The .env file is already configured for local development
# It points to http://localhost:5002/api

# Start frontend development server
npm run dev
```

The frontend will run on http://localhost:5173 or http://localhost:5174

### 3. Access the Application

Open your browser and navigate to:
- http://localhost:5173 (or the port shown in terminal)

## Production Build

### 1. Update Environment Variables

Before building for production, update the frontend environment variable:

```bash
cd frontend

# Edit .env.production
# Change VITE_API_URL to your production API URL
# Example: VITE_API_URL=https://yourdomain.com/api
```

### 2. Build Frontend

```bash
cd frontend

# Build for production
npm run build

# The dist/ folder will contain the production-ready files
```

### 3. Deploy Backend

#### Option A: Using PM2 (Recommended)

```bash
cd backend

# Make sure .env is configured for production
# Set FRONTEND_URL to your production domain
# Example: FRONTEND_URL=https://yourdomain.com

# Install PM2 globally (if not installed)
npm install -g pm2

# Start the backend
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs backend
```

#### Option B: Manual Start

```bash
cd backend

# Set NODE_ENV to production
export NODE_ENV=production  # Linux/Mac
# or
set NODE_ENV=production  # Windows

# Start the server
npm start
```

### 4. Deploy Frontend

#### cPanel Hosting (Apache)

1. Upload all files from `frontend/dist/` to your `public_html` directory
2. Upload `frontend/.htaccess` to the same directory
3. Ensure file permissions are set correctly (644 for files, 755 for directories)

#### VPS with Nginx

1. Copy `frontend/dist/` contents to `/var/www/html` (or your configured directory)
2. Configure Nginx (see NAMECHEAP_DEPLOYMENT.md for details)
3. Restart Nginx

## Environment Variables

### Backend (.env)

| Variable | Description | Development Value | Production Value |
|----------|-------------|------------------|------------------|
| PORT | Server port | 5002 | 5002 (or your choice) |
| NODE_ENV | Environment mode | development | production |
| FRONTEND_URL | Allowed CORS origins | http://localhost:5173,http://localhost:5174 | https://yourdomain.com |
| MONGO_URI | MongoDB connection | Your Atlas URI | Your Atlas URI |
| JWT_SECRET | Secret for JWT tokens | Random string | Strong random string |

### Frontend (.env / .env.production)

| Variable | Description | Development Value | Production Value |
|----------|-------------|------------------|------------------|
| VITE_API_URL | Backend API URL | http://localhost:5002/api | https://yourdomain.com/api |

## Running in Both Environments Simultaneously

If you need to support both local development AND production access to the same backend:

### Backend Configuration

Edit `backend/.env`:
```
FRONTEND_URL=http://localhost:5173,http://localhost:5174,https://yourdomain.com
```

This allows the backend to accept requests from both local development and production frontend.

## Troubleshooting

### Issue: "Network Error" in Browser Console

**Solution**: 
- Check that VITE_API_URL in frontend matches your backend URL
- Verify backend is running and accessible
- Check browser console for CORS errors

### Issue: Blank Page After Deployment

**Solutions**:
1. Verify `base: './'` is set in `vite.config.ts`
2. Check `.htaccess` file is uploaded (for Apache)
3. Verify all files from `dist/` are uploaded
4. Check browser console for errors

### Issue: Socket.IO Not Connecting

**Solutions**:
- Verify VITE_API_URL is set correctly
- Check that FRONTEND_URL in backend includes your frontend domain
- Ensure WebSocket connections are allowed by your hosting provider

### Issue: API Calls Failing

**Solutions**:
- Open browser dev tools → Network tab
- Check the API URL being called
- Verify it matches your backend URL
- Check backend logs for errors

## Testing Your Setup

### Local Development Test

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Try to register a new user
5. Check browser console for errors

### Production Test

1. Build frontend: `cd frontend && npm run build`
2. Serve dist/ folder using a local server:
   ```bash
   cd dist
   npx serve -p 8080
   ```
3. Open http://localhost:8080
4. Verify all features work
5. Check for console errors

## Scripts Reference

### Backend Scripts

```bash
npm run dev       # Start development server with nodemon
npm start         # Start production server
npm run build     # Compile TypeScript to JavaScript
```

### Frontend Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Additional Resources

- [NAMECHEAP_DEPLOYMENT.md](./NAMECHEAP_DEPLOYMENT.md) - Detailed deployment guide for Namecheap
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common deployment issues and solutions
- [README.md](./README.md) - Project overview and features

## Support

If you encounter issues not covered in this guide:

1. Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) file
2. Review browser console for error messages
3. Check backend logs for errors
4. Verify all environment variables are set correctly
5. Ensure MongoDB Atlas is accessible (check IP whitelist)
