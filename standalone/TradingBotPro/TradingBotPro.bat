@echo off 
echo ======================================== 
echo    TRADING BOT PRO - STANDALONE VERSION 
echo ======================================== 
echo. 
echo 🚀 Starting Trading Bot Pro... 
echo. 
echo 📋 This is a standalone version that requires Node.js 
echo    to be installed on the target computer. 
echo. 
echo ⚠️  Make sure Node.js is installed from: https://nodejs.org/ 
echo. 
if not exist "node_modules" ( 
    echo 📦 Installing dependencies... 
    npm install 
    echo. 
) 
echo 🎯 Launching Trading Bot Pro... 
echo. 
npm start 
echo. 
echo ✅ Application closed! 
pause 
