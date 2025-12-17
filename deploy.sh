#!/bin/bash

# Production deployment script for E-Commerce application
# This script should be run on your production server (VPS)

echo "🚀 Starting E-Commerce Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root or with sudo"
  exit
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    apt install -y nginx
fi

# Set application directory
APP_DIR="/var/www/E-Commerce"

# Clone or pull latest code
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}🔄 Updating existing application...${NC}"
    cd $APP_DIR
    git pull
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    cd /var/www
    git clone https://github.com/Daud2712/E-Commerce.git
    cd E-Commerce
fi

# Setup backend
echo -e "${YELLOW}⚙️  Setting up backend...${NC}"
cd $APP_DIR/backend

# Install dependencies
npm install --production

# Build backend
npm run build

# Create logs directory
mkdir -p logs

# Create uploads directory if it doesn't exist
mkdir -p public/uploads
chmod 755 public/uploads

# Setup environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create one from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your production settings${NC}"
    exit 1
fi

# Start/Restart PM2
echo -e "${YELLOW}🔄 Starting backend with PM2...${NC}"
pm2 delete ecommerce-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup frontend
echo -e "${YELLOW}⚙️  Setting up frontend...${NC}"
cd $APP_DIR/frontend

# Install dependencies
npm install

# Build frontend
npm run build

# Setup Nginx
echo -e "${YELLOW}⚙️  Configuring Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/ecommerce"

# Ask for domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME

# Create Nginx configuration
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Frontend
    root $APP_DIR/frontend/dist;
    index index.html;
    
    # Increase client body size for file uploads
    client_max_body_size 50M;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files (uploads)
    location /uploads {
        proxy_pass http://localhost:5002;
    }
}
EOF

# Enable site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with production values"
echo "2. Setup SSL certificate: sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
echo "3. Check application status: pm2 status"
echo "4. View logs: pm2 logs ecommerce-api"
echo ""
echo "Your application should now be accessible at: http://$DOMAIN_NAME"
