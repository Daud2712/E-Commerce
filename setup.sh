#!/bin/bash

# E-Commerce Platform Setup Script for macOS/Linux
# This script sets up the development environment for both backend and frontend

echo "========================================"
echo "E-Commerce Platform Setup (Unix)"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js v16 or higher from https://nodejs.org${NC}"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm is installed: v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm is not installed.${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "Setting up Backend"
echo "========================================"

# Setup Backend
if [ -d "backend" ]; then
    cd backend
    
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠ IMPORTANT: Please edit backend/.env with your MongoDB URI and JWT secret${NC}"
    else
        echo -e "${GREEN}✓ .env file already exists${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Backend setup complete!${NC}"
else
    echo -e "${RED}✗ Backend directory not found${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "Setting up Frontend"
echo "========================================"

# Setup Frontend
if [ -d "frontend" ]; then
    cd frontend
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠ You can edit frontend/.env to change the API URL if needed${NC}"
    else
        echo -e "${GREEN}✓ .env file already exists${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✓ Frontend setup complete!${NC}"
else
    echo -e "${RED}✗ Frontend directory not found${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit backend/.env with your MongoDB URI and JWT secret"
echo "2. Run backend:  cd backend && npm run dev"
echo "3. Run frontend: cd frontend && npm run dev"
echo ""
echo -e "${CYAN}Access the application at http://localhost:5173${NC}"
echo ""
