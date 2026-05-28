# 🚀 AI-Powered Code Translator — Deployment Guide

This guide provides instructions to deploy your full-stack MERN application without bugs. 

---

## 🏗️ Deployment Strategy: Unified vs. Split

You can deploy this application using two methods:

| Method | Strategy | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Option A (Recommended)** | **Unified Hosting (Express serves React)** | • Single hosting service (e.g. Render Web Service)<br>• **Zero CORS issues** (same domain/port)<br>• Free/Hobby tier friendly | • Build time is slightly longer since both build in one instance |
| **Option B** | **Split Hosting (Frontend on Vercel, Backend on Render)** | • Separate scaling<br>• Fast frontend updates | • Must manage CORS<br>• Must configure API URLs correctly |

---

## 🛠️ Option A: Unified Hosting (Render or Railway) - Recommended

Since we configured the Express backend to automatically compile and serve the React build folder (`client/dist`) when `NODE_ENV=production` is set, you can run the entire application on a single web service.

### 1. Connecting to Render / Railway
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Render](https://render.com) or [Railway](https://railway.app) and create a new **Web Service** linked to your repository.

### 2. Configure Service Settings
- **Root Directory:** Leave blank (root).
- **Runtime:** `Node`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### 3. Add Environment Variables
Add the following key-value pairs in the **Environment** section of your dashboard.

> [!IMPORTANT]
> Because Vite embeds frontend environment variables during compile time, **`VITE_GOOGLE_CLIENT_ID` must be defined on your dashboard before running the build**.

| Variable | Required | Value / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | `5000` (Render handles this automatically, but set it for consistency) |
| `MONGODB_URI` | Yes | Connection string to your MongoDB Atlas cluster |
| `JWT_SECRET` | Yes | A long, secure random string to sign auth tokens |
| `GEMINI_API_KEY` | Yes | Your Google Gemini API Key (supports comma-separated values for rotation) |
| `GOOGLE_CLIENT_ID` | Yes | Client ID created in Google Cloud Console for backend token validation |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Must match `GOOGLE_CLIENT_ID`. Vite bundles this into the client during `npm run build`. |
| `EMAIL_USER` | No | Your Gmail address (for registration verification OTPs) |
| `EMAIL_PASS` | No | Your Google App Password (not your Gmail login password) |
| `EMAIL_SERVICE` | No | `gmail` |

---

## 🛠️ Option B: Split Hosting (React on Vercel, Node on Render)

If you prefer to host your React client separately:

### 1. Deploy the Backend (Render)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Configure the environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, etc.) in the Render dashboard.

### 2. Deploy the Frontend (Vercel)
- **Root Directory:** `client`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- Configure the environment variables in Vercel:
  - `VITE_API_URL` = `https://your-backend-service.onrender.com/api` (no trailing slash)
  - `VITE_GOOGLE_CLIENT_ID` = `your_google_client_id`

---

## ⚡ Critical Post-Deployment Steps to Prevent Bugs

### 1. MongoDB Network Access (Atlas IP Whitelisting)
Cloud providers (like Render or Railway) use dynamic IP addresses. If MongoDB Atlas blocks these IPs, your database connection will fail.
1. Log into [MongoDB Atlas](https://mongodb.com).
2. Go to **Network Access** (under Security).
3. Click **Add IP Address**.
4. Choose **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Save changes. 

> [!NOTE]
> If your MongoDB fails to connect, the application's built-in **JSON File DB fallback** will automatically handle accounts and histories locally so that the application never crashes.

### 2. Google OAuth Redirect URIs
If you use Google Login, you must whitelist your production URLs, or Google will block authentication with an `origin_mismatch` error.
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://your-app-name.onrender.com` (your production URL)
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173`
   - `https://your-app-name.onrender.com`
5. Click **Save** and wait 2-5 minutes for Google's servers to sync.

---

## 🕵️ Troubleshooting Deployment Failures

### 1. OTP Verification / Email issues
- If your emails do not send in production, verify you are using an **App Password** from Google Accounts (under Security -> 2-Step Verification -> App Passwords). Do not use your plain Gmail password.
- If you don't configure SMTP credentials, check your service logs/console outputs. The application is designed to gracefully print verification OTPs in the application logs so that users can copy them and log in.

### 2. CORS Errors (Option B only)
- If your frontend on Vercel is blocked from requesting the API on Render, check that the CORS setup on the server (`server/src/app.js`) is allowing origins. 
- You can adjust the origin from `*` to your Vercel URL:
  ```javascript
  app.use(cors({
    origin: "https://your-frontend.vercel.app",
    credentials: true,
  }));
  ```
