# E-Commerce Platform - Deployment Guide

## Overview
Your E-Commerce application consists of:
- **Frontend:** React + Vite (can be hosted on static hosting)
- **Backend:** Node.js + Express (requires Node.js hosting)
- **Database:** MongoDB (requires MongoDB hosting)

## Prerequisites
- GitHub account (you already have this ✓)
- Backend hosting account (Render/Railway)
- MongoDB Atlas account

---

## Step-by-Step Deployment

### 1. Deploy MongoDB Database (5 minutes)

1. Go to https://mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Create a new cluster (select FREE tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Keep this connection string - you'll need it next

### 2. Deploy Backend to Render (10 minutes)

1. **Sign up at https://render.com**
   - Use your GitHub account to sign in

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Daud2712/E-Commerce`
   - Configure:
     - **Name:** `ecommerce-backend` (or any name you prefer)
     - **Region:** Choose closest to your users
     - **Branch:** `main`
     - **Root Directory:** `backend`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

3. **Set Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:

   ```
   PORT=5002
   MONGODB_URI=<your-mongodb-connection-string-from-step-1>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   ```

   For M-Pesa (if you're using it):
   ```
   MPESA_CONSUMER_KEY=<your-mpesa-consumer-key>
   MPESA_CONSUMER_SECRET=<your-mpesa-consumer-secret>
   MPESA_SHORTCODE=<your-mpesa-shortcode>
   MPESA_PASSKEY=<your-mpesa-passkey>
   ```

4. **Click "Create Web Service"**
   - Render will deploy your backend
   - Wait 5-10 minutes for deployment to complete
   - You'll get a URL like: `https://ecommerce-backend-xxxx.onrender.com`
   - **SAVE THIS URL - YOU'LL NEED IT!**

### 3. Update Frontend Configuration

1. **Update the backend URL**

   Edit `frontend/.env.production`:
   ```env
   VITE_API_URL=https://your-actual-backend-url.onrender.com/api
   ```

   Replace `your-actual-backend-url.onrender.com` with your actual Render URL from Step 2.

2. **Rebuild the frontend with production settings**
   ```bash
   cd frontend
   npm run build
   ```

   This creates a new `dist/` folder with the correct backend URL.

### 4. Upload Frontend to Namecheap

1. **Access Namecheap cPanel**
   - Log into your Namecheap account
   - Go to your hosting control panel

2. **Open File Manager**
   - Navigate to `public_html` (or `www` or `httpdocs` depending on your setup)
   - Delete any existing files in this directory

3. **Upload Files**
   - Upload ALL contents from `frontend/dist/` folder:
     - `index.html`
     - `assets/` folder (with all files inside)

   **IMPORTANT:** Upload the CONTENTS of dist, not the dist folder itself!

   Your structure should be:
   ```
   public_html/
     ├── index.html
     └── assets/
         ├── index-DbUmPe8k.css
         └── index-DJIsOEwB.js
   ```

4. **Set proper permissions**
   - Files: 644
   - Folders: 755

### 5. Configure Backend CORS

Make sure your backend allows requests from your Namecheap domain:

In `backend/src/index.ts`, the CORS should include your domain:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

You'll need to update this and redeploy on Render.

---

## Alternative: Deploy Everything for Free (Recommended)

Instead of using Namecheap for frontend, deploy everything on free platforms:

### Frontend Options:
1. **Vercel** (Recommended)
   - Sign up at https://vercel.com
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Add environment variable: `VITE_API_URL=<your-render-backend-url>/api`
   - Deploy!

2. **Netlify**
   - Sign up at https://netlify.com
   - Similar process to Vercel

**Benefits:**
- Automatic deployments when you push to GitHub
- Free SSL certificates
- Better performance with CDN
- No manual file uploads

---

## Checklist Before Going Live

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Backend deployed to Render
- [ ] Backend environment variables configured
- [ ] Backend is accessible (test: `https://your-backend.onrender.com/api/`)
- [ ] Frontend .env.production updated with backend URL
- [ ] Frontend rebuilt with `npm run build`
- [ ] Frontend uploaded to hosting
- [ ] CORS configured to allow your frontend domain
- [ ] Test registration and login
- [ ] Test product listing and cart
- [ ] Test order placement

---

## Important Notes

1. **Free Tier Limitations:**
   - Render free tier: Server sleeps after 15 minutes of inactivity (first request will be slow)
   - MongoDB Atlas free tier: 512MB storage limit
   - Consider upgrading if you get significant traffic

2. **Security:**
   - Never commit `.env` files with real credentials
   - Change JWT_SECRET to a random string
   - Use strong MongoDB passwords

3. **Updates:**
   - When you update backend: Push to GitHub → Render auto-deploys
   - When you update frontend: Rebuild and re-upload to Namecheap (or use Vercel/Netlify for auto-deployment)

---

## Need Help?

- Render docs: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- Vercel docs: https://vercel.com/docs

## Quick Command Reference

```bash
# Build frontend for production
cd frontend
npm run build

# Build backend for production
cd backend
npm install
npm start

# Check backend is running
curl https://your-backend.onrender.com/api/
```
