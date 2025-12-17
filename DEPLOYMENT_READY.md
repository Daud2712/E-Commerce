# 🚀 Deployment Package Ready for Namecheap

**Date:** December 17, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready

---

## 📦 What's Included

Your application has been built and prepared for Namecheap deployment with the following updates:

### ✅ Features Implemented
- **Stock Management:** Auto-deduct stock on orders, mark out-of-stock products
- **Notification System:** Role-based notifications (Buyer/Seller/Rider)
- **Fixed Issues:** Notifications now go to specific users only
- **Production Builds:** Both frontend and backend compiled and optimized

### 📁 Deployment Files

```
E-Commerce/
├── frontend/
│   └── dist/                 ← FRONTEND FILES (Upload to public_html)
│       ├── index.html
│       ├── .htaccess        ← Already included!
│       └── assets/
│           ├── index-*.css
│           └── index-*.js
│
├── backend/
│   ├── dist/                 ← BACKEND BUILD (Upload to api/ folder)
│   ├── package.json
│   ├── package-lock.json
│   ├── ecosystem.config.js   ← PM2 config for VPS
│   ├── .env.example         ← Template for environment variables
│   └── public/
│       └── uploads/          ← Create this on server!
│
└── NAMECHEAP_DEPLOYMENT.md   ← Detailed deployment guide
```

---

## 🎯 Quick Start: Choose Your Deployment Method

### Option 1: Shared Hosting (cPanel) - Easiest
- Best for: Small to medium traffic
- Requirements: cPanel with Node.js Selector
- Monthly Cost: ~$3-10/month
- [Jump to instructions](#option-1-shared-hosting-cpanel)

### Option 2: VPS Hosting - Recommended
- Best for: Better performance and control
- Requirements: VPS with root access
- Monthly Cost: ~$10-20/month
- [Jump to instructions](#option-2-vps-hosting)

### Option 3: Cloud Platform - Alternative
- Best for: Auto-scaling needs
- Providers: Railway, Render, Heroku
- Monthly Cost: Free tier available
- [Jump to instructions](#option-3-cloud-platform)

---

## Option 1: Shared Hosting (cPanel)

### Step 1: Prepare Environment Variables

Before uploading, you need your MongoDB connection string:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't already)
3. Get your connection string (looks like: `mongodb+srv://username:password@...`)
4. Whitelist your Namecheap server IP (or 0.0.0.0/0 for all IPs)

### Step 2: Upload Frontend

1. **Connect via FTP** (FileZilla, cPanel File Manager, or WinSCP)
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password

2. **Navigate to `public_html/`** (or your domain's folder)

3. **Upload these files from `frontend/dist/`:**
   ```
   ✅ index.html
   ✅ .htaccess (IMPORTANT!)
   ✅ assets/ folder (entire folder)
   ```

4. **Verify structure looks like:**
   ```
   public_html/
   ├── index.html
   ├── .htaccess
   └── assets/
       ├── index-CmaasR_D.css
       └── index-C4yuJRZx.js
   ```

### Step 3: Upload Backend

1. **Create folder:** Create a folder called `api` in your home directory
   - Path should be: `/home/yourusername/api/`

2. **Upload these backend files:**
   ```
   ✅ package.json
   ✅ package-lock.json
   ✅ dist/ folder (entire folder)
   ✅ ecosystem.config.js
   ```

3. **Create uploads directory:**
   - Create: `/home/yourusername/api/public/uploads/`
   - Set permissions: 755

### Step 4: Setup Node.js Application in cPanel

1. **Login to cPanel → Setup Node.js App**

2. **Click "Create Application"** and fill in:
   ```
   Node.js version: 18.x or higher
   Application mode: Production
   Application root: /home/yourusername/api
   Application URL: api.yourdomain.com (or subdirectory)
   Application startup file: dist/index.js
   ```

3. **Add Environment Variables:**
   ```
   PORT=5002
   MONGO_URI=mongodb+srv://your-connection-string-here
   JWT_SECRET=your-random-secret-minimum-32-characters-long
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Click "Create"**

### Step 5: Install Dependencies & Start

1. In cPanel Node.js App interface:
   - Click "Run NPM Install"
   - Wait for completion (may take 2-3 minutes)

2. **Start the application:**
   - Click "Start App" button
   - Status should show "Running" ✅

### Step 6: Update Frontend API URL

⚠️ **CRITICAL STEP:**

Your frontend needs to know where your backend is!

1. **Option A: Rebuild frontend locally (Recommended)**
   ```bash
   # Update .env.production
   cd E-Commerce/frontend
   nano .env.production
   # Change VITE_API_URL to: https://api.yourdomain.com/api

   # Rebuild
   npm run build

   # Re-upload dist/ folder to public_html
   ```

2. **Option B: Use .htaccess proxy (Advanced)**
   - Add proxy rules to route `/api` to your Node.js app
   - See NAMECHEAP_DEPLOYMENT.md for details

### Step 7: Test Your Deployment

1. **Test Backend:**
   - Visit: `https://api.yourdomain.com/` or `https://yourdomain.com:5002/`
   - Should see: "Freshedtz backend is running."

2. **Test Frontend:**
   - Visit: `https://yourdomain.com`
   - App should load
   - Try logging in

3. **Test WebSocket:**
   - Open browser console (F12)
   - Should see: `[SOCKET] Connected with ID: ...`

---

## Option 2: VPS Hosting

### Prerequisites
- VPS with Ubuntu 20.04+ or similar
- Root or sudo access
- Domain pointing to your VPS IP

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
# Or
ssh username@your-vps-ip
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 3: Upload Your Files

**Option A: Using SCP/SFTP**
```bash
# From your local machine
scp -r E-Commerce root@your-vps-ip:/var/www/
```

**Option B: Using Git (Recommended)**
```bash
# On VPS
cd /var/www
git clone https://github.com/Daud2712/E-Commerce.git
cd E-Commerce
```

### Step 4: Setup Backend

```bash
cd /var/www/E-Commerce/backend

# Install dependencies
npm install --production

# Copy the built files (already built locally)
# If not built, run: npm run build

# Create uploads directory
mkdir -p public/uploads
chmod 755 public/uploads

# Create .env file
nano .env
```

Add to `.env`:
```env
PORT=5002
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-random-secret-key-here
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

Save and exit (Ctrl+X, Y, Enter)

### Step 5: Start Backend with PM2

```bash
# Start using ecosystem config
pm2 start ecosystem.config.js

# Or start manually
pm2 start dist/index.js --name ecommerce-api

# Setup PM2 to start on system boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs ecommerce-api
```

### Step 6: Setup Frontend

```bash
cd /var/www/E-Commerce/frontend

# The dist folder is already built and ready!
# Just verify it exists
ls -la dist/
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/ecommerce
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /var/www/E-Commerce/frontend/dist;
    index index.html;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads
    location /uploads {
        proxy_pass http://localhost:5002;
    }
}
```

Enable and test:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts (choose redirect to HTTPS)
```

### Step 9: Test Everything

```bash
# Check backend is running
curl http://localhost:5002

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View logs
pm2 logs ecommerce-api
```

Visit your domain and test!

---

## Option 3: Cloud Platform

### Deploy Backend to Railway/Render

1. **Create account** on [Railway.app](https://railway.app) or [Render.com](https://render.com)

2. **Create new project** from GitHub
   - Connect your repository
   - Select backend folder

3. **Configure:**
   ```
   Build Command: npm run build
   Start Command: node dist/index.js
   Root Directory: backend
   ```

4. **Add Environment Variables:**
   ```
   PORT=5002
   MONGO_URI=your-mongodb-connection
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.com
   ```

5. **Deploy** - Platform will auto-deploy

### Deploy Frontend to Netlify/Vercel

1. **Create account** on [Netlify](https://netlify.com) or [Vercel](https://vercel.com)

2. **Import project** from GitHub
   - Select repository
   - Set base directory: `frontend`

3. **Build settings:**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

5. **Deploy** - Will auto-build and deploy

---

## 🔍 Testing Checklist

After deployment, test these features:

### Authentication
- [ ] User registration (Buyer, Seller, Rider)
- [ ] Login
- [ ] Logout
- [ ] Session persistence (refresh page)

### Products (Seller)
- [ ] Create product with images
- [ ] Edit product
- [ ] Delete product
- [ ] View products list

### Shopping (Buyer)
- [ ] Browse products
- [ ] Add to cart
- [ ] View cart
- [ ] Checkout
- [ ] View orders

### Stock Management
- [ ] Place order - stock decreases ✅
- [ ] Product shows out of stock when stock = 0 ✅
- [ ] Cancel order - stock restored ✅
- [ ] Seller gets notification when product out of stock ✅

### Notifications
- [ ] Buyer receives order confirmation ✅
- [ ] Seller receives new order notification ✅
- [ ] Rider receives delivery assignment ✅
- [ ] Notifications go to correct users only ✅

### WebSocket
- [ ] Browser console shows: `[SOCKET] Connected with ID: ...`
- [ ] Notifications appear in real-time
- [ ] Reconnects after disconnect

---

## 🐛 Troubleshooting

### Backend Not Starting

**Check logs:**
```bash
# cPanel: Check error logs in Node.js App interface
# VPS: pm2 logs ecommerce-api
```

**Common issues:**
1. **MongoDB connection failed**
   - Verify MONGO_URI is correct
   - Check MongoDB Atlas IP whitelist

2. **Port already in use**
   - Change PORT in environment variables
   - Kill existing process: `pm2 delete ecommerce-api`

3. **Missing dependencies**
   - Run: `npm install --production`

### Frontend Not Loading

1. **Check .htaccess is uploaded**
   - File must be in same folder as index.html

2. **Check API URL**
   - Frontend must point to correct backend URL
   - Check browser console for API errors

3. **Clear browser cache**
   ```
   Chrome: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   ```

### Notifications Not Working

1. **Check socket connection**
   - Open browser console (F12)
   - Look for: `[SOCKET] Connected with ID: ...`

2. **Check backend logs**
   ```bash
   # Should see:
   [SOCKET] User connected: ...
   [SOCKET] Buyer 123 (abc) joined room: user-123
   ```

3. **If using proxy (cPanel):**
   - Ensure WebSocket is enabled
   - Check .htaccess proxy rules

### Stock Not Deducting

1. **Check backend logs:**
   ```
   [CHECKOUT] Product: X, Current Stock: 10, Requested: 2
   [CHECKOUT] Deducting stock: 10 -> 8
   [CHECKOUT] Stock updated successfully. New stock: 8
   ```

2. **If logs appear but stock unchanged:**
   - Check MongoDB connection
   - Verify transaction completed

---

## 📊 File Sizes

**Frontend:**
- Total: ~243 KB (CSS) + 628 KB (JS) = ~871 KB
- Gzipped: ~33 KB (CSS) + 193 KB (JS) = ~226 KB

**Backend:**
- Built files: ~50-100 KB
- node_modules: ~150 MB (not uploaded, install on server)

---

## 🔐 Security Checklist

Before going live:

- [ ] Change JWT_SECRET to strong random string (32+ characters)
- [ ] Use HTTPS (SSL certificate)
- [ ] Update CORS to allow only your domain
- [ ] Remove .env files from public folders
- [ ] Set MongoDB to whitelist specific IPs (not 0.0.0.0/0)
- [ ] Secure file upload directory (755 permissions)
- [ ] Enable firewall on VPS
- [ ] Regular backups of database

---

## 📞 Support

### Application Issues
- Check logs first (browser console + backend logs)
- Review error messages
- Consult NAMECHEAP_DEPLOYMENT.md for detailed guides

### Hosting Issues
- **Namecheap:** https://www.namecheap.com/support/
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

### GitHub Repository
- https://github.com/Daud2712/E-Commerce

---

## 🎉 You're Ready to Deploy!

**Next Steps:**
1. Choose deployment method (Option 1, 2, or 3)
2. Follow step-by-step instructions
3. Test thoroughly using checklist
4. Go live! 🚀

**Remember:**
- Frontend files are in: `frontend/dist/`
- Backend files are in: `backend/dist/` + `backend/package.json` + `backend/ecosystem.config.js`
- Update `VITE_API_URL` to match your backend URL
- Don't forget to create `.env` file on server

Good luck with your deployment! 💪
