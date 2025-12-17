# Quick Start Guide

Get the E-Commerce platform running in 5 minutes!

## Prerequisites Check

Before you begin, ensure you have:
- ✅ Node.js v16+ installed ([Download](https://nodejs.org))
- ✅ Git installed ([Download](https://git-scm.com))
- ✅ MongoDB Atlas account ([Sign up free](https://www.mongodb.com/cloud/atlas))

Verify installations:
```bash
node --version  # Should show v16 or higher
npm --version   # Should show 7 or higher
git --version   # Should show 2.x or higher
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone & Setup (2 minutes)

**Windows (PowerShell):**
```powershell
# Clone repository
git clone https://github.com/Daud2712/E-Commerce.git
cd E-Commerce

# Run automated setup
.\setup.ps1
```

**macOS/Linux:**
```bash
# Clone repository
git clone https://github.com/Daud2712/E-Commerce.git
cd E-Commerce

# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

### Step 2: Configure MongoDB (2 minutes)

1. **Get MongoDB Connection String:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

2. **Update Backend .env:**

**Windows:**
```powershell
notepad backend\.env
```

**macOS/Linux:**
```bash
nano backend/.env
# or
code backend/.env  # if using VS Code
```

Replace:
```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ecommerce
JWT_SECRET=change-this-to-a-random-string-123456789
```

### Step 3: Run the Application (1 minute)

**Option A: Run Both Servers at Once (Recommended)**
```bash
# From root directory
npm run dev
```

**Option B: Run Servers Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

## 🎯 Test the Application

### Create Test Accounts

1. **Register as Buyer:**
   - Email: buyer@test.com
   - Password: password123
   - Role: Buyer

2. **Register as Seller:**
   - Email: seller@test.com
   - Password: password123
   - Role: Seller

3. **Register as Rider:**
   - Email: rider@test.com
   - Password: password123
   - Role: Rider

### Test Workflow

1. **As Seller:**
   - Login → Add products → Upload images → Set prices

2. **As Buyer:**
   - Login → Browse products → Add to cart → Checkout

3. **As Seller (again):**
   - View orders → Assign rider to delivery

4. **As Rider:**
   - Login → View assigned deliveries → Accept → Update status

5. **As Buyer (again):**
   - Check order status → See real-time updates → Confirm receipt

## 🐳 Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Make sure Docker Desktop is running
docker-compose up --build

# Access at http://localhost
```

That's it! MongoDB, Backend, and Frontend all running in containers.

## 📱 What You Can Do Now

### As Buyer
- Browse products in different categories
- Add items to cart
- Place orders with shipping address
- Track deliveries in real-time
- Switch between 6 languages
- Confirm receipt of orders

### As Seller
- Add/Edit/Delete products
- Upload product images
- View all orders
- Assign riders to deliveries
- View sales reports
- Track revenue and expenses
- Get real-time notifications

### As Rider
- View assigned deliveries
- Accept or reject delivery requests
- Update delivery status
- See delivery locations
- Track completed deliveries

## 🔧 Common Issues & Solutions

### "Port 5002 is already in use"

**Windows:**
```powershell
netstat -ano | findstr :5002
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5002 | xargs kill -9
```

### "Cannot connect to MongoDB"

1. Check your MongoDB Atlas IP whitelist:
   - Go to Network Access in Atlas
   - Add IP: `0.0.0.0/0` (for development)

2. Verify connection string in `backend/.env`

3. Check database user permissions in Atlas

### "Module not found" errors

```bash
# Clear and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Frontend shows blank page

1. Check browser console for errors (F12)
2. Verify backend is running on port 5002
3. Check `VITE_API_URL` in `frontend/.env`
4. Try clearing browser cache

## 📚 Next Steps

- **Read the full [README](README.md)** for detailed information
- **Check [DEPLOYMENT.md](DEPLOYMENT.md)** for production deployment
- **Explore the API** at `http://localhost:5002/api`
- **Join discussions** or report issues on GitHub

## 💡 Tips

1. **Keep terminals visible** to see real-time logs
2. **Use Chrome DevTools** to inspect API calls
3. **Check Network tab** if data isn't loading
4. **Watch console logs** for Socket.IO connection status
5. **Test all roles** to see the full workflow

## 🎓 Learning Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Express**: https://expressjs.com
- **MongoDB**: https://university.mongodb.com
- **Socket.IO**: https://socket.io/docs

## 🆘 Need Help?

- **Documentation**: Check README.md and DEPLOYMENT.md
- **GitHub Issues**: Report bugs or request features
- **Stack Overflow**: Search for common issues
- **MongoDB Forums**: For database-related questions

---

**Happy Coding! 🚀**

Made with ❤️ for learning and building awesome e-commerce applications.
