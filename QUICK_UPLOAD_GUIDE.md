# 📤 Quick Upload Guide for Namecheap

## 📋 Pre-Upload Checklist

- [ ] MongoDB Atlas cluster created & connection string ready
- [ ] Domain/subdomain configured
- [ ] FTP/cPanel credentials ready
- [ ] Read full deployment guide (DEPLOYMENT_READY.md)

---

## 🎯 What to Upload Where

### 1️⃣ Frontend → `public_html/`

**Upload from: `E-Commerce/frontend/dist/`**

```
📁 public_html/
   ├── 📄 index.html               ← Upload this
   ├── 📄 .htaccess                ← MUST upload this!
   └── 📁 assets/                  ← Upload entire folder
       ├── 📄 index-CmaasR_D.css
       └── 📄 index-C4yuJRZx.js
```

**How to upload:**
1. Login to cPanel File Manager OR FTP
2. Navigate to `public_html/`
3. Select ALL files from `frontend/dist/`
4. Upload (may take 1-2 minutes)
5. Verify .htaccess is there (enable "Show Hidden Files")

---

### 2️⃣ Backend → `/home/yourusername/api/`

**Upload from: `E-Commerce/backend/`**

```
📁 api/
   ├── 📄 package.json             ← Upload this
   ├── 📄 package-lock.json        ← Upload this
   ├── 📄 ecosystem.config.js      ← Upload this
   └── 📁 dist/                    ← Upload entire folder
       └── (all .js files)
```

**How to upload:**
1. Create folder: `/home/yourusername/api/`
2. Upload the 3 files + dist folder
3. Create subfolder: `public/uploads/`
4. Set permissions on uploads: 755

**DON'T upload:**
- ❌ node_modules (install on server)
- ❌ src folder (not needed)
- ❌ .env file (create manually on server)

---

## ⚙️ Environment Variables to Set

### In cPanel Node.js App:

```env
PORT=5002
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/ecommerce
JWT_SECRET=your-random-32-character-secret-key
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

**To generate JWT_SECRET:**
```bash
# Run on your computer:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 After Upload

### Step 1: Install Dependencies
In cPanel Node.js App → Click "Run NPM Install"

### Step 2: Start Application
Click "Start App" button → Status should show "Running" ✅

### Step 3: Update Frontend API URL

**IMPORTANT:** Frontend needs to know backend location!

**Option A: Rebuild frontend (Recommended)**
```bash
# On your local computer:
cd E-Commerce/frontend

# Edit .env.production:
# Change VITE_API_URL=https://api.yourdomain.com/api

# Rebuild:
npm run build

# Re-upload only these from dist/:
- index.html
- assets/index-*.js  (the JavaScript file)
```

**Option B: Configure subdomain**
- If backend is: `https://api.yourdomain.com`
- Set: `VITE_API_URL=https://api.yourdomain.com/api`

---

## ✅ Testing Your Site

### Test 1: Backend is Running
Visit: `https://api.yourdomain.com/`
Should see: **"Freshedtz backend is running."**

### Test 2: Frontend Loads
Visit: `https://yourdomain.com`
Should see: **Your application homepage**

### Test 3: Can Register/Login
1. Click "Register"
2. Create buyer account
3. Login
4. Check browser console (F12) for: `[SOCKET] Connected with ID: ...`

### Test 4: Stock Management Works
1. Login as seller → Create product with stock = 2
2. Login as buyer → Buy 2 items
3. Check product → Should show "Out of Stock" ✅

---

## 📱 File Structure Summary

```
Your Namecheap Server:
├── public_html/                      ← Your website root
│   ├── index.html                   ← Frontend
│   ├── .htaccess                    ← IMPORTANT!
│   └── assets/
│       ├── index-*.css
│       └── index-*.js
│
└── /home/yourusername/
    └── api/                          ← Backend folder
        ├── package.json
        ├── package-lock.json
        ├── ecosystem.config.js
        ├── dist/                     ← Built backend code
        │   ├── index.js
        │   ├── controllers/
        │   ├── models/
        │   ├── routes/
        │   └── utils/
        └── public/
            └── uploads/              ← Create this!
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Backend API Error"
**Solution:** Check VITE_API_URL in frontend matches your backend URL

### Issue 2: "Cannot GET /"
**Solution:** Make sure .htaccess is uploaded to public_html

### Issue 3: Backend won't start
**Solution:**
1. Check MONGO_URI is correct
2. Verify all environment variables are set
3. Check error logs in cPanel

### Issue 4: Notifications not working
**Solution:**
1. Check browser console for socket connection
2. Verify backend is running
3. Refresh page

### Issue 5: Images not uploading
**Solution:**
1. Check `api/public/uploads/` folder exists
2. Set folder permissions to 755
3. Verify multer is configured correctly

---

## 📊 File Sizes (for upload time estimate)

| Item | Size | Upload Time (10 Mbps) |
|------|------|----------------------|
| Frontend (dist) | ~1 MB | ~1 second |
| Backend (without node_modules) | ~100 KB | <1 second |
| Total Upload | ~1.1 MB | ~2 seconds |

**Note:** node_modules (~150 MB) is installed on server, not uploaded.

---

## 🎯 Quick Checklist

**Before Upload:**
- [ ] Built frontend (`npm run build` completed)
- [ ] Built backend (`npm run build` completed)
- [ ] Have MongoDB connection string
- [ ] Have FTP/cPanel access

**During Upload:**
- [ ] Uploaded frontend to public_html/
- [ ] Uploaded .htaccess file
- [ ] Uploaded backend to api/
- [ ] Created uploads folder

**After Upload:**
- [ ] Set environment variables
- [ ] Ran NPM install
- [ ] Started Node.js app
- [ ] Updated VITE_API_URL (if needed)
- [ ] Tested backend URL
- [ ] Tested frontend loads
- [ ] Tested login works
- [ ] Tested stock deduction

---

## 🆘 Need Help?

1. **Check logs first:**
   - Browser console (F12)
   - cPanel → Node.js App → View Logs

2. **Read full guide:**
   - See DEPLOYMENT_READY.md for detailed instructions
   - See NAMECHEAP_DEPLOYMENT.md for hosting specifics

3. **Verify settings:**
   - Environment variables correct?
   - MongoDB connection working?
   - CORS allows your domain?

---

## 🎉 That's It!

Your deployment package is ready. Follow these steps and you'll be live in minutes!

**Estimated total time:** 15-30 minutes (first time)

Good luck! 🚀
