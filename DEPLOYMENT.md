# Deployment Guide

## Frontend Deployment (Vercel)

The frontend is configured to deploy to Vercel automatically.

### Setup Steps:

1. **Push to GitHub**
   - Ensure your latest changes are pushed.

2. **Set Environment Variable:**
   - In Vercel Project Settings → Environment Variables
   - Add: `VITE_API_URL`
   - Value: `https://play-money-prediction-app.onrender.com/api`
   - This connects your Vercel frontend to your live Render backend.

3. **Deploy:**
   - Redeploy your latest commit in Vercel to pick up the new environment variable.

## Backend Deployment (Render)

Your backend is already live at: `https://play-money-prediction-app.onrender.com`

### Configuration Details:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `server`
- **Environment Variables:**
  - `MONGO_URI`: Your MongoDB connection string

## Local Development

To run locally:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The frontend will use the local backend proxy (`/api` -> `localhost:5000`) unless `VITE_API_URL` is set in `.env`.
