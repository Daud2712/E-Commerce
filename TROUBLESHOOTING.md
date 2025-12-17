# Troubleshooting Deployment Issues

## Problem: Plain/Blank Page in Production

If you see a blank/plain page when accessing your deployed domain, try these solutions:

### Solution 1: Check Build Output

```bash
cd frontend
npm run build
ls -la dist/
```

Verify these files exist in `dist/`:
- `index.html`
- `assets/` folder with JS and CSS files

### Solution 2: Update Vite Configuration

The `vite.config.ts` has been updated with:
- `base: './'` for relative paths
- Proper build output configuration

After updating, rebuild:
```bash
npm run build
```

### Solution 3: Verify .htaccess (Apache/cPanel)

Ensure `.htaccess` is in the same directory as `index.html`:

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

### Solution 4: Check File Permissions

On VPS or shared hosting:
```bash
chmod 755 /path/to/public_html
chmod 644 /path/to/public_html/index.html
chmod 644 /path/to/public_html/.htaccess
```

### Solution 5: Check Browser Console

1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

Common issues:
- **404 errors**: Files not uploaded or wrong directory
- **CORS errors**: Backend URL incorrect in .env
- **Module errors**: Build issue, rebuild the frontend

### Solution 6: Verify Environment Variables

Before building, check `frontend/.env.production`:

```env
VITE_API_URL=https://yourdomain.com/api
```

Then rebuild:
```bash
npm run build
```

### Solution 7: Clear Cache

- Clear browser cache (Ctrl+Shift+Delete)
- Clear hosting cache (if applicable)
- Try incognito/private window

### Solution 8: Check Hosting Configuration

#### For Namecheap cPanel:
1. Ensure files are in correct directory (`public_html` for main domain)
2. Check if Node.js app is running (for backend)
3. Verify domain is pointed correctly in DNS

#### For VPS with Nginx:
Check nginx configuration:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Solution 9: Manual Deployment Checklist

1. ✅ Build frontend: `npm run build`
2. ✅ Upload `dist/` contents to web root
3. ✅ Upload `.htaccess` file
4. ✅ Set correct file permissions
5. ✅ Check backend is running
6. ✅ Verify API URL in environment variables

### Solution 10: Test Locally First

Before deploying, test the production build locally:

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit http://localhost:4173 to see production build.

## Quick Fix Commands

### Rebuild and Check
```bash
cd frontend
rm -rf dist node_modules
npm install
npm run build
ls -la dist/
```

### Upload via SFTP/FTP
- Upload everything from `dist/` folder
- Upload `.htaccess` to same location
- DO NOT upload `node_modules` or `src`

### Verify Deployment
```bash
# Check if index.html is accessible
curl https://yourdomain.com/index.html

# Check if assets load
curl https://yourdomain.com/assets/index-xxxxx.js
```

## Still Having Issues?

1. Check server error logs
2. Verify DNS propagation: https://dnschecker.org
3. Contact hosting support
4. Share specific error messages for targeted help
