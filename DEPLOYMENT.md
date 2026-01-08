# E-Commerce Deployment Guide

## Environment Configuration

This application is configured to work in **both localhost development and Namecheap production hosting**.

### Development (Localhost)

1. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

2. **Start the backend (optional):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on: http://localhost:5002

3. **Environment behavior:**
   - `.env.development` is used automatically
   - Frontend uses Vite proxy (`/api` → `http://localhost:5002`)
   - If local backend is down, API calls will fail
   - To use production backend during dev, set in `.env.development`:
     ```
     VITE_API_URL=https://e-commerce-backend-g1t5.onrender.com/api
     ```

### Production (Namecheap)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   Creates `dist/` folder with static files

2. **Upload to Namecheap:**
   - Upload contents of `frontend/dist/` to your Namecheap public_html folder
   - Files needed: index.html, assets/, etc.

3. **Environment behavior:**
   - `.env.production` is used during build
   - Frontend connects to: `https://e-commerce-backend-g1t5.onrender.com/api`
   - No proxy needed - direct API calls

### Environment Files

**frontend/.env.development** (localhost)
```env
VITE_API_URL=
VITE_SOCKET_URL=http://localhost:5002
```

**frontend/.env.production** (Namecheap)
```env
VITE_API_URL=https://e-commerce-backend-g1t5.onrender.com/api
VITE_SOCKET_URL=https://e-commerce-backend-g1t5.onrender.com
```

**backend/.env** (if running locally)
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/freshedtz
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Deployment Checklist

- [ ] Frontend `.env.production` points to correct backend URL
- [ ] Backend is deployed and accessible (Render)
- [ ] MongoDB connection string is correct on backend
- [ ] CORS allows your Namecheap domain
- [ ] Run `npm run build` before uploading
- [ ] Upload entire `dist/` folder contents
- [ ] Test all API endpoints after deployment

### Troubleshooting

**"Failed to fetch database"**
- Check if backend is running (Render free tier sleeps after 15min)
- Verify backend URL in `.env.production`
- Check browser console for CORS errors

**Local development not working**
- Ensure backend is running on port 5002
- Check MongoDB is running locally
- Verify `.env.development` settings

**Production build not connecting**
- Clear browser cache
- Check Network tab in DevTools
- Verify backend URL is accessible
