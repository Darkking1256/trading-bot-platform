@echo off
echo 🚀 Railway Deployment Script
echo ============================

echo 📦 Installing root dependencies...
call npm install

echo 🔨 Building React client...
cd client
call npm install
call npm run build
cd ..

echo ✅ Build completed!
echo.
echo 📋 Next steps:
echo 1. Commit and push changes to GitHub
echo 2. Railway will automatically deploy
echo 3. Check: https://trading-bot-platform-production-d64d.up.railway.app/
echo.
echo 🎯 Expected behavior:
echo - React app will be served at root URL
echo - API endpoints available at /api/*
echo - Health check at /api/health
echo.
pause
