# Deployment Guide

This guide explains how to deploy the frontend and backend separately.

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Sign up at [Railway.app](https://railway.app/)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" or "Empty Project"

3. **Add MongoDB**
   - Click "New" → "Database" → "Add MongoDB"
   - Copy the MongoDB connection string

4. **Deploy Backend**
   - Click "New" → "GitHub Repo" (or upload files)
   - Select your repository
   - Railway will auto-detect Node.js

5. **Set Environment Variables**
   ```
   MONGODB_URI=your_mongodb_atlas_or_railway_mongodb_uri
   PORT=3000
   ```

6. **Configure Start Command**
   - Go to Settings → Deploy
   - Set Start Command: `node api.js`

7. **Get Your Backend URL**
   - Railway will provide a URL like: `https://your-app.railway.app`

### Option 2: Render

1. **Sign up at [Render.com](https://render.com/)**

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - Name: `nsut-placements-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node api.js`

4. **Add Environment Variables**
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   ```

5. **Deploy**
   - Your backend URL: `https://nsut-placements-api.onrender.com`

### Option 3: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json` in root**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   cd "e:\NSUT Placements"
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `MONGODB_URI`

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

1. **Navigate to Frontend Directory**
   ```bash
   cd "e:\NSUT Placements\Frontend\NSUT Placement Stats"
   ```

2. **Create `.env.production`**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

3. **Install Vercel CLI** (if not already)
   ```bash
   npm install -g vercel
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Configure in Vercel Dashboard**
   - Go to Settings → Environment Variables
   - Add `VITE_API_URL` with your backend URL

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the App**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_API_URL=https://your-backend-url.railway.app`

### Option 3: GitHub Pages (Static)

1. **Update `vite.config.js`**
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react()],
   })
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm install -D gh-pages
   ```

3. **Add to `package.json`**
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=3000
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

## Testing the Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend-url.com/data
   ```

2. **Test Frontend**
   - Visit your deployed frontend URL
   - Check browser console for any CORS or API errors
   - Verify data loads correctly

## CORS Configuration

Make sure your backend `api.js` has proper CORS configuration:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Common Issues

1. **CORS Errors**
   - Add your frontend URL to CORS allowed origins in backend

2. **API URL Not Working**
   - Check `.env.production` file exists
   - Verify `VITE_API_URL` is set in deployment platform
   - Rebuild frontend after changing environment variables

3. **MongoDB Connection Failed**
   - Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
   - Verify `MONGODB_URI` is correctly set

## Local Development

Frontend still works locally:
```bash
# Terminal 1: Backend
cd "e:\NSUT Placements"
npm run dev

# Terminal 2: Frontend
cd "e:\NSUT Placements\Frontend\NSUT Placement Stats"
npm run dev
```

The `.env` file will use `http://localhost:3000` for local development.
