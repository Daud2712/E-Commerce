# E-Commerce Platform Setup Script for Windows
# This script sets up the development environment for both backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "E-Commerce Platform Setup (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js v16 or higher from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Setup Backend
if (Test-Path "backend") {
    Set-Location backend
    
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "⚠ IMPORTANT: Please edit backend/.env with your MongoDB URI and JWT secret" -ForegroundColor Yellow
    } else {
        Write-Host "✓ .env file already exists" -ForegroundColor Green
    }
    
    Set-Location ..
    Write-Host "✓ Backend setup complete!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Setup Frontend
if (Test-Path "frontend") {
    Set-Location frontend
    
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "⚠ You can edit frontend/.env to change the API URL if needed" -ForegroundColor Yellow
    } else {
        Write-Host "✓ .env file already exists" -ForegroundColor Green
    }
    
    Set-Location ..
    Write-Host "✓ Frontend setup complete!" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend/.env with your MongoDB URI and JWT secret" -ForegroundColor White
Write-Host "2. Run backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "3. Run frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access the application at http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
