# 🚀 Quick Deployment Reference

## 📍 Repository Information
- **GitHub:** https://github.com/Daud2712/E-Commerce
- **Latest Commit:** b623b60
- **Date:** December 17, 2025

## 🌐 Live Application URLs

### Development (Local)
```
Frontend: http://localhost:5173
Backend:  http://localhost:5002
```

### Production
```
Frontend: https://yourdomain.com
Backend:  https://yourdomain.com/api
```

## 📦 Files to Upload

### ✅ Upload to `public_html/` (Frontend)
All files from `frontend/dist/`:
- ✅ index.html
- ✅ .htaccess
- ✅ favicon.ico
- ✅ assets/ folder (all files)

**Current Build:**
- CSS: 242.89 kB
- Bootstrap JS: 93.99 kB  
- Vendor JS: 161.15 kB
- Main JS: 351.25 kB
- **Total:** ~850 kB (~213 kB gzipped)

### ✅ Upload to `api/` or `backend/` (Backend)
All files from `backend/`:
- ✅ src/ folder
- ✅ package.json
- ✅ tsconfig.json
- ✅ .env (create on server)
- ✅ ecosystem.config.js
- ❌ node_modules/ (install on server)

## ⚙️ Environment Variables

### Frontend: `.env.production`
```env
VITE_API_URL=https://yourdomain.com/api
```

### Backend: `.env`
```env
PORT=5002
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_strong_secret_here
```

## 🔧 Quick Commands

### Build Frontend
```powershell
cd frontend
npm install
npm run build
```

### Deploy Backend (on server)
```bash
cd api
npm install
pm2 start ecosystem.config.js
pm2 save
```

### Check Status
```bash
pm2 status
pm2 logs backend
```

## 📚 Documentation Files

1. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Complete upload checklist
2. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Local & production setup guide
3. [NAMECHEAP_DEPLOYMENT.md](./NAMECHEAP_DEPLOYMENT.md) - Namecheap-specific instructions
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
5. [README.md](./README.md) - Project overview and features

## ✨ Recent Changes

### Commit b623b60 (Latest)
- ✅ Fixed all remaining translation function calls
- ✅ Replaced parameterized translations with plain text
- ✅ Added complete deployment documentation
- ✅ Updated repository links in all docs
- ✅ Rebuilt frontend (dist folder ready)

### Commit 0d335c4
- ✅ Replaced all translation keys with plain text
- ✅ Removed i18next from pages
- ✅ Simplified button labels (Accept, Reject, etc.)

## 🎯 Testing Checklist

### After Upload
- [ ] Homepage loads without errors
- [ ] Browser console shows no errors
- [ ] All images and assets load
- [ ] Can register new user
- [ ] Can login
- [ ] Cart functionality works
- [ ] Can place orders
- [ ] Real-time notifications work

### API Tests
```bash
# Test backend health
curl https://yourdomain.com/api/health

# Or check in browser
https://yourdomain.com/api
```

## 🆘 Quick Troubleshooting

### Blank Page?
1. Check `vite.config.ts` has `base: './'` ✅
2. Ensure `.htaccess` is uploaded ✅
3. Check browser console for errors
4. Verify file permissions (644 files, 755 folders)

### API Errors?
1. Check `.env` on server
2. Verify CORS settings
3. Run `pm2 logs backend`
4. Check MongoDB connection

### Build Locally First!
```powershell
# Always test before deploying
cd frontend
npm run build
npx serve -p 8080 dist
# Open http://localhost:8080 and test
```

## 📞 Support

- **Issues:** https://github.com/Daud2712/E-Commerce/issues
- **MongoDB:** https://www.mongodb.com/docs/atlas/
- **PM2:** https://pm2.keymetrics.io/docs/

---

**Last Updated:** December 17, 2025  
**Status:** ✅ Ready for deployment to both environments
