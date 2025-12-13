# Quick Start Guide - E-Commerce Product System

## Issue: "Loading products..." stuck

### Root Cause
The backend and frontend are working correctly. The issue is likely that:
1. **No products exist in the database yet** - The page shows "Loading products..." if there's an API error OR if the database is empty but the UI doesn't handle the empty state properly.
2. **MongoDB might not be running** - The backend needs MongoDB to be running locally.

### Solution Steps:

## Step 1: Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data/db
# OR if using Homebrew
brew services start mongodb-community
```

**Docker (Alternative):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Connected to MongoDB
Server is running on port 5000
```

## Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Step 4: Test the System

### Register Users:

1. **Create a Seller Account:**
   - Go to `http://localhost:5173/register`
   - Name: "Test Seller"
   - Email: "seller@test.com"
   - Password: "password123"
   - Role: Select "Seller"
   - Click Register

2. **Login as Seller:**
   - Email: "seller@test.com"
   - Password: "password123"

3. **Add Products:**
   - Go to "Products" in navigation
   - Click "Add New Product"
   - Fill in:
     - Name: "Test Product 1"
     - Description: "This is a test product"
     - Price: 29.99
     - Stock: 10
     - Image URL: "https://via.placeholder.com/300"
     - Category: "Electronics"
   - Click "Add Product"

4. **Verify Products Show:**
   - You should now see the product in the seller's table view

5. **Test as Buyer:**
   - Logout
   - Register new account as "Buyer"
   - Login
   - Go to Products page
   - You should see the product in grid view
   - Test search and filter features

## Troubleshooting

### "Loading products..." never finishes:

**Check Browser Console:**
- Open Developer Tools (F12)
- Look for errors in Console tab
- Look for failed API calls in Network tab

**Common Issues:**

1. **CORS Error:**
   - Make sure backend has `app.use(cors())` (already configured)
   - Backend should show: `Access-Control-Allow-Origin: *`

2. **MongoDB Not Connected:**
   - Backend logs should show "Connected to MongoDB"
   - If not, start MongoDB first

3. **Wrong API URL:**
   - Frontend calls `http://localhost:5000/api/products`
   - Make sure backend is running on port 5000

4. **Authentication Issue:**
   - The products page now uses `optionalAuth` middleware
   - Sellers see their products, buyers see all available products
   - No authentication required for buyers to browse

### "Seller can not list product" - This is now FIXED!

The issue was that the `/api/products` endpoint wasn't using authentication middleware, so sellers couldn't see their products.

**Fix Applied:**
- Created `optionalAuth` middleware in [auth.ts](backend/src/middleware/auth.ts:40-56)
- Updated products route to use `optionalAuth` in [products.ts](backend/src/routes/products.ts:21)

**How it works now:**
- If user is authenticated as Seller → Shows ONLY their products
- If user is authenticated as Buyer → Shows ALL available products
- If not authenticated → Shows ALL available products

### Test the Fix:

```bash
# 1. Make sure backend is rebuilt with the changes
cd backend
npm run dev

# 2. Open browser to http://localhost:5173
# 3. Login as seller
# 4. Go to Products page
# 5. Click "Add New Product"
# 6. You should see the form and be able to add products
```

## API Testing with curl

### Test products endpoint (no auth - shows available products):
```bash
curl http://localhost:5000/api/products
```

### Test as authenticated seller:
```bash
# First login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"password123"}'

# Copy the token and use it
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create a product:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "stock": 10,
    "category": "Electronics"
  }'
```

## Complete Test Flow

1. ✅ Start MongoDB
2. ✅ Start Backend → See "Connected to MongoDB" and "Server is running on port 5000"
3. ✅ Start Frontend → Opens on http://localhost:5173
4. ✅ Register as Seller
5. ✅ Add products using the form
6. ✅ Products appear in seller's table
7. ✅ Logout and register as Buyer
8. ✅ Browse products in grid view
9. ✅ Test search and filters
10. ✅ Add to cart
11. ✅ Checkout
12. ✅ Verify stock decreased
13. ✅ View order in "My Orders"

## Success Indicators

✅ Backend console shows:
```
Connected to MongoDB
Server is running on port 5000
```

✅ Frontend shows:
- Sellers: Table view of their products with "Add New Product" button
- Buyers: Grid view of available products with search/filter

✅ No console errors in browser

✅ Products can be created, viewed, and purchased

✅ Stock updates automatically after purchase

---

## Still Having Issues?

1. Check MongoDB is running: `mongosh` (should connect)
2. Check backend logs for errors
3. Check browser console for errors
4. Verify API calls in Network tab
5. Make sure ports 5000 (backend) and 5173 (frontend) are not in use by other apps

For more details, see [PRODUCT_SYSTEM_DOCUMENTATION.md](PRODUCT_SYSTEM_DOCUMENTATION.md)
