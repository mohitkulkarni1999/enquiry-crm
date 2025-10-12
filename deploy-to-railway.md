# 🚂 Railway Deployment Guide - FIXED VERSION

## ✅ Problem Fixed!
- Changed from deprecated Nixpacks to Dockerfile builder
- Added Spring Boot Actuator for health checks
- Fixed health check path to `/api/v1/actuator/health`

## 🚀 Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Fixed Railway configuration - ready for deployment"
git push
```

### 2. Railway Backend Deployment
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add MySQL database first
4. Add new service from GitHub repo
5. **Important**: Set Root Directory to `backend` for backend service
6. Add these environment variables:
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   MYSQLUSER=<from MySQL service>
   MYSQLPASSWORD=<from MySQL service>
   MYSQLHOST=<from MySQL service>
   MYSQLPORT=<from MySQL service>
   MYSQLDATABASE=<from MySQL service>
   SPRING_PROFILES_ACTIVE=prod
   ```

### 3. Railway Frontend Deployment
1. Add another service from same GitHub repo
2. **Important**: Set Root Directory to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api/v1
   ```

## 🎯 What's Fixed
- ✅ Health check endpoint: `/api/v1/actuator/health`
- ✅ Dockerfile builder instead of deprecated Nixpacks
- ✅ Spring Boot Actuator added for monitoring
- ✅ Proper CORS configuration for Railway domains

## 🔍 Health Check Test
Once deployed, test: `https://your-app.railway.app/api/v1/actuator/health`
Should return: `{"status":"UP"}`

Your deployment should work perfectly now! 🎉
