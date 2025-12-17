# Deployment Checklist

**Repository:** https://github.com/Daud2712/E-Commerce  
**Latest Commit:** 0d335c4 (December 17, 2025)

## 📦 Files to Upload for Production

### Frontend Files
Upload these files to your web server's `public_html` directory:

```
📁 public_html/
├── 📄 index.html
├── 📄 .htaccess (IMPORTANT for SPA routing)
├── 📄 favicon.ico
└── 📁 assets/
    ├── index-CmaasR_D.css (242.89 kB)
    ├── bootstrap-DCRSy28Z.js (93.99 kB)
    ├── vendor-BEaxiNVF.js (161.15 kB)
    └── index-DjzPdKCf.js (352.97 kB)
```

**Upload Location:** All files from `frontend/dist/` folder  
**Method:** FTP, cPanel File Manager, or SSH

### Backend Files
Upload these to a separate directory (e.g., `api/` or `backend/`):

```
📁 api/
├── 📁 src/
│   ├── index.ts
│   ├── types.ts
│   ├── 📁 controllers/
│   ├── 📁 middleware/
│   ├── 📁 models/
│   ├── 📁 routes/
│   └── 📁 utils/
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 .env (IMPORTANT - configure before uploading)
└── 📄 ecosystem.config.js (for PM2)
```

**Upload Location:** Entire `backend/` folder  
**Note:** Do NOT upload `node_modules/` - install on server instead

## ✅ Pre-Deployment Checklist

### Frontend
- [ ] Run `npm run build` in frontend directory
- [ ] Verify dist folder created successfully
- [ ] Update `.env.production` with production API URL
- [ ] Check that `vite.config.ts` has `base: './'`
- [ ] Ensure `.htaccess` file exists

### Backend
- [ ] Create `.env` file with production values
- [ ] Set `FRONTEND_URL` to production domain(s)
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas connection
- [ ] Generate strong `JWT_SECRET`
- [ ] Verify all routes are protected

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist configured (0.0.0.0/0 for any IP or specific IPs)
- [ ] Connection string tested locally

## 🚀 Deployment Steps

### Step 1: Build Frontend Locally
```powershell
cd frontend
npm run build
```
**Expected Output:** dist/ folder with optimized files

### Step 2: Upload Frontend Files
**Via FTP:**
1. Connect to your hosting via FTP
2. Navigate to `public_html/`
3. Upload all files from `frontend/dist/`
4. Ensure `.htaccess` is uploaded

**Via cPanel File Manager:**
1. Login to cPanel
2. Open File Manager
3. Navigate to `public_html/`
4. Click Upload
5. Select all files from `frontend/dist/`
6. Upload

### Step 3: Upload Backend Files
1. Create `api/` directory in your hosting
2. Upload entire `backend/` folder contents
3. **Do not upload node_modules/**

### Step 4: Configure Backend Environment
Create `.env` file on server with:
```env
PORT=5002
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com,http://localhost:5173
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your_very_strong_secret_key_here
```

### Step 5: Install Backend Dependencies
**SSH into server:**
```bash
cd api
npm install
```

### Step 6: Start Backend with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔗 Access Your Application

### Local Development
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5002
- **Repository:** https://github.com/Daud2712/E-Commerce

### Production
- **Frontend:** https://yourdomain.com
- **Backend API:** https://yourdomain.com/api (if using reverse proxy)

## 🧪 Testing After Deployment

### Frontend Tests
- [ ] Homepage loads without errors
- [ ] All images and assets load correctly
- [ ] Navigation works (check browser console for errors)
- [ ] Registration page accessible
- [ ] Login page accessible

### Backend Tests
- [ ] API responds at `/api/health` or similar endpoint
- [ ] Registration creates new users
- [ ] Login returns JWT token
- [ ] CORS allows frontend domain

### Integration Tests
- [ ] Login from frontend successfully authenticates
- [ ] Cart functionality works
- [ ] Orders can be placed
- [ ] Seller can view orders
- [ ] Rider can accept deliveries
- [ ] Real-time notifications working (Socket.IO)

## 📋 Environment Variables Reference

### Frontend (.env.production)
```env
VITE_API_URL=https://yourdomain.com/api
```

### Backend (.env)
```env
PORT=5002
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=random_strong_secret
```

## 🔄 Updating Production

### Update Frontend
```powershell
# Local machine
cd frontend
git pull origin main
npm install
npm run build

# Upload dist/ files to server
# Replace files in public_html/
```

### Update Backend
```bash
# On server
cd api
git pull origin main
npm install
pm2 restart backend
```

## 🆘 Troubleshooting

### Blank Page After Deployment
1. Check browser console for errors
2. Verify `base: './'` in vite.config.ts
3. Ensure .htaccess is uploaded
4. Check file permissions (644 for files, 755 for directories)

### API Connection Errors
1. Verify VITE_API_URL in .env.production
2. Check CORS settings in backend
3. Ensure backend is running (pm2 status)
4. Check firewall rules

### Database Connection Failed
1. Verify MongoDB Atlas connection string
2. Check IP whitelist in MongoDB Atlas
3. Ensure database user has correct permissions

## 📞 Support Resources

- **Documentation:** See README.md, ENVIRONMENT_SETUP.md, TROUBLESHOOTING.md
- **Repository Issues:** https://github.com/Daud2712/E-Commerce/issues
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/

## 🎯 Quick Deploy Commands

```bash
# Local - Build frontend
cd frontend && npm run build

# Server - Deploy backend
cd api
npm install
pm2 start ecosystem.config.js
pm2 save

# Server - Check status
pm2 status
pm2 logs backend
```

## ✨ Latest Changes (Commit 0d335c4)

- ✅ Replaced all translation keys with plain text
- ✅ Removed i18next dependency usage from pages
- ✅ Simplified UI text display
- ✅ Updated button labels (Accept, Reject, etc.)
- ✅ All status messages now in plain English

---

**Note:** Always test locally before deploying to production. Keep backups of your production database.
