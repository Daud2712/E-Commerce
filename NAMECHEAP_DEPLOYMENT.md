# Namecheap Deployment Guide

**Last Updated:** December 17, 2025  
**Repository:** https://github.com/Daud2712/E-Commerce  
**Latest Commit:** 0d335c4 - Translation keys replaced with plain text

This guide will help you deploy the E-Commerce application to Namecheap shared hosting or VPS.

## Prerequisites

- Namecheap hosting account (Shared or VPS)
- Node.js support on your hosting (cPanel with Node.js Selector or VPS with Node.js installed)
- MongoDB Atlas account (free tier available)
- Domain name (optional, can use Namecheap subdomain)

## Option 1: Shared Hosting with cPanel

### Step 1: Prepare Your Files

1. Build the frontend:
```bash
cd frontend
npm install
npm run build
```

2. Build the backend:
```bash
cd backend
npm install
npm run build
```

### Step 2: Upload Files via FTP/File Manager

1. Upload frontend `dist` folder contents to `public_html` (or your domain's folder)
2. Upload backend files to a folder like `api` or `backend` in your home directory

### Step 3: Setup Node.js Application (cPanel)

1. Go to cPanel → Setup Node.js App
2. Click "Create Application"
3. Configure:
   - Node.js version: Latest LTS (18.x or higher)
   - Application mode: Production
   - Application root: `/home/username/api` (or your backend folder)
   - Application URL: `api.yourdomain.com` or use subdirectory
   - Application startup file: `dist/index.js`

4. Click "Create"

### Step 4: Set Environment Variables

In the Node.js App configuration, add environment variables:

```
PORT=5002
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Step 5: Configure Frontend Environment

Create `.env.production` in frontend folder before building:

```
VITE_API_URL=https://api.yourdomain.com/api
```

Rebuild frontend and re-upload:
```bash
npm run build
```

### Step 6: Setup .htaccess for Frontend

Create `.htaccess` in your `public_html` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 7: Start the Application

1. In cPanel Node.js App, click "Start App"
2. Verify it's running by visiting your API URL

## Option 2: VPS Hosting

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

### Step 3: Clone and Setup Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/E-Commerce.git
cd E-Commerce

# Setup backend
cd backend
npm install
npm run build

# Setup frontend
cd ../frontend
npm install
npm run build
```

### Step 4: Configure Environment Variables

```bash
# Backend environment
cd /var/www/E-Commerce/backend
nano .env
```

Add:
```
PORT=5002
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Step 5: Setup PM2

```bash
cd /var/www/E-Commerce/backend
pm2 start dist/index.js --name ecommerce-api
pm2 startup
pm2 save
```

### Step 6: Configure Nginx

```bash
nano /etc/nginx/sites-available/ecommerce
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend
    root /var/www/E-Commerce/frontend/dist;
    index index.html;
    
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
    
    # Static files (uploads)
    location /uploads {
        proxy_pass http://localhost:5002;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup SSL (Optional but Recommended)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Option 3: Using Node.js Hosting Services

### Deploy Backend to Railway/Render/Heroku

1. Create account on Railway.app or Render.com
2. Create new project from GitHub
3. Set environment variables in dashboard
4. Deploy

### Deploy Frontend to Netlify/Vercel

1. Create account on Netlify or Vercel
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy

## MongoDB Atlas Setup

1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for all IPs, or specific hosting IPs)
5. Get connection string
6. Replace in backend .env file

## Important Notes

### For All Environments:

1. **Always use HTTPS in production**
2. **Set strong JWT_SECRET**
3. **Enable CORS only for your frontend domain**
4. **Keep .env files secure** (never commit to git)
5. **Use environment-specific builds**

### File Upload Directory:

Make sure upload directory is writable:
```bash
chmod 755 backend/public/uploads
```

### Domain Configuration:

Update these files with your actual domain:
- Frontend: `.env.production` → `VITE_API_URL`
- Backend: `.env` → `FRONTEND_URL`

### Testing Deployment:

1. Test API: `https://yourdomain.com/api/` should return "Freshedtz backend is running"
2. Test frontend: `https://yourdomain.com` should load the application
3. Test WebSocket: Check browser console for socket connection

## Troubleshooting

### Backend not starting:
- Check Node.js version (use v18+)
- Verify MongoDB connection string
- Check port availability
- Review logs: `pm2 logs` (VPS) or cPanel error logs

### Frontend not loading:
- Check .htaccess file is present
- Verify VITE_API_URL is correct
- Clear browser cache
- Check browser console for errors

### File uploads failing:
- Verify uploads directory exists and is writable
- Check file size limits in hosting
- Verify correct path in multer configuration

### Socket.IO not connecting:
- Check CORS configuration
- Verify proxy settings in Nginx
- Check firewall allows WebSocket connections

## Support

For hosting-specific issues:
- Namecheap: https://www.namecheap.com/support/
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

For application issues:
- Check application logs
- Review GitHub issues
- Contact development team
