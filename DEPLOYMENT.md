# Deployment Guide

This guide covers deploying the E-Commerce platform to various environments.

## Table of Contents
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Render.com](#rendercom)
  - [Vercel + Render](#vercel--render)
  - [AWS](#aws)
- [Environment Variables](#environment-variables)

## Local Development

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB)
- Git

### Quick Start

**Windows:**
```powershell
.\setup.ps1
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Clone and Install**
```bash
# Clone repository
git clone <your-repo-url>
cd E-Commerce

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Edit .env if needed
```

2. **Configure Environment**

**Backend `.env`:**
```env
PORT=5002
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5002/api
```

3. **Run Development Servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access: http://localhost:5173

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Install Docker and Docker Compose**
   - Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

2. **Update Environment Variables**

Edit `docker-compose.yml` and update:
- MongoDB credentials
- JWT secret
- API URL

3. **Build and Run**

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:5002
- MongoDB: localhost:27017

### Individual Container Deployment

**Backend:**
```bash
cd backend
docker build -t ecommerce-backend .
docker run -p 5002:5002 \
  -e MONGO_URI=your-mongo-uri \
  -e JWT_SECRET=your-secret \
  ecommerce-backend
```

**Frontend:**
```bash
cd frontend
docker build -t ecommerce-frontend .
docker run -p 80:80 ecommerce-frontend
```

## Cloud Deployment

### Render.com

#### Backend Deployment

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "backend" as root directory

2. **Configure Service**
   ```
   Name: ecommerce-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   ```
   PORT=5002
   MONGO_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Note your backend URL: `https://ecommerce-backend.onrender.com`

#### Frontend Deployment

1. **Update Frontend .env**
   ```env
   VITE_API_URL=https://ecommerce-backend.onrender.com/api
   ```

2. **Create Static Site**
   - Click "New +" → "Static Site"
   - Select "frontend" as root directory
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Vercel + Render

**Backend on Render** (same as above)

**Frontend on Vercel:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Set Environment Variables in Vercel Dashboard**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### AWS (EC2)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Security Group: Allow ports 22, 80, 443, 5002

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

4. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd E-Commerce

# Setup Backend
cd backend
npm install
npm run build
pm2 start dist/index.js --name ecommerce-backend
pm2 save
pm2 startup

# Setup Frontend
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/ecommerce
```

5. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/E-Commerce/frontend/dist;
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
    }
}
```

6. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5002` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `random-string-here` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5002/api` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (optional) | `AIza...` |

## SSL Certificate (Production)

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Logs

### PM2 (Node.js Process Manager)

```bash
# View logs
pm2 logs ecommerce-backend

# Monitor
pm2 monit

# Restart
pm2 restart ecommerce-backend

# Stop
pm2 stop ecommerce-backend
```

### Docker Logs

```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

## Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Windows
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5002 | xargs kill -9
```

2. **MongoDB connection fails**
   - Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
   - Verify connection string format
   - Ensure database user has correct permissions

3. **CORS errors**
   - Update backend CORS settings in `src/index.ts`
   - Ensure frontend URL is allowed

4. **Build fails**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be v16+)

## Backup & Restore

### MongoDB Backup

```bash
# Backup
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." backup-20241217/
```

## Support

For issues and questions:
- GitHub Issues: [your-repo/issues]
- Email: support@example.com
