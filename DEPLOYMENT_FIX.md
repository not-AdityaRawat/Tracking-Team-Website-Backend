# IMPORTANT: Deployment Configuration

## Current Setup Issue
❌ **PROBLEM**: Both frontend and backend are trying to deploy to Netlify
✅ **SOLUTION**: Deploy them separately

## Correct Deployment:

### Backend (Node.js/Express API)
Deploy to: **Render** or **Railway** (NOT Netlify)

**Why?** 
- Netlify is for static sites (React, HTML, CSS)
- Your backend needs Node.js runtime
- Render/Railway support Node.js servers

**Steps:**
1. Go to https://render.com
2. New Web Service → Connect `Tracking-Team-Website-Backend` repo
3. Configure:
   - Build: `npm install`
   - Start: `node api.js`
4. Add env vars:
   - `MONGODB_URI`
   - `PORT=3000`
5. Deploy → Get URL like: `https://nsut-placement-api.onrender.com`

### Frontend (React PWA)
Deploy to: **Vercel** or **Netlify**

**Steps:**
1. Update `.env.production` with backend URL:
   ```
   VITE_API_URL=https://nsut-placement-api.onrender.com
   ```
2. Push to GitHub
3. Vercel/Netlify auto-deploys

## Update Backend CORS

Once backend is deployed, update `api.js`:

```javascript
app.use(cors({
    origin: [
        'https://tracking-team.vercel.app',
        'https://your-frontend.netlify.app',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}));
```

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
PORT=3000
```

### Frontend (.env.production)
```
VITE_API_URL=https://nsut-placement-api.onrender.com
```

## Verify Deployment

1. **Test Backend**: 
   ```bash
   curl https://nsut-placement-api.onrender.com/data
   ```
   Should return: `{"count":602}`

2. **Test Frontend**:
   Visit your Vercel URL
   Check browser console for errors
   Data should load successfully

## Common Mistakes

❌ Deploying Node.js backend to Netlify
❌ Having trailing slash in API URL
❌ Not updating CORS origins
❌ Not setting environment variables on hosting platform
✅ Backend on Render/Railway
✅ Frontend on Vercel/Netlify
✅ CORS configured correctly
✅ Environment variables set
