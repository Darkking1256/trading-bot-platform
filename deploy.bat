@echo off
chcp 65001 >nul
echo 🤖 Trading Bot Platform - Deployment Script
echo ==============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Node.js is not installed. You'll need it for local development.
    echo Download from: https://nodejs.org/
)

echo [INFO] Starting deployment process...
echo.

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "
if "%GITHUB_USERNAME%"=="" (
    echo [ERROR] GitHub username is required!
    pause
    exit /b 1
)

REM Get repository name
set /p REPO_NAME="Enter repository name (default: trading-bot-platform): "
if "%REPO_NAME%"=="" set REPO_NAME=trading-bot-platform

echo [INFO] Repository will be: %GITHUB_USERNAME%/%REPO_NAME%
echo.

REM Check if git repository is already initialized
if not exist ".git" (
    echo [INFO] Initializing git repository...
    git init
    echo [SUCCESS] Git repository initialized
) else (
    echo [INFO] Git repository already exists
)

REM Check if remote origin already exists
git remote get-url origin >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Remote origin already exists. Do you want to update it? (y/n)
    set /p UPDATE_REMOTE=""
    if /i "%UPDATE_REMOTE%"=="y" (
        git remote remove origin
    ) else (
        echo [INFO] Keeping existing remote origin
    )
)

REM Add remote origin if it doesn't exist
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [INFO] Adding GitHub remote origin...
    git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
    echo [SUCCESS] Remote origin added
)

REM Update README with correct GitHub username
echo [INFO] Updating README with your GitHub username...
powershell -Command "(Get-Content README.md) -replace 'yourusername', '%GITHUB_USERNAME%' | Set-Content README.md"
echo [SUCCESS] README updated

REM Add all files
echo [INFO] Adding files to git...
git add .
echo [SUCCESS] Files added to git

REM Create initial commit
echo [INFO] Creating initial commit...
git commit -m "Initial commit: Advanced Trading Bot Platform

🤖 Features:
- Multi-strategy trading bot engine
- Real-time market data and signals
- Advanced risk management
- Social trading features
- Professional UI/UX
- Mobile responsive design

📊 Trading Strategies:
- Moving Average Crossover
- RSI Divergence
- Bollinger Bands

🛡️ Risk Management:
- Position sizing
- Stop-loss/take-profit
- Portfolio monitoring
- Risk alerts

🚀 Ready for testing and deployment!"
echo [SUCCESS] Initial commit created

REM Push to GitHub
echo [INFO] Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo [ERROR] Failed to push to GitHub. Please check your credentials and repository access.
    pause
    exit /b 1
)
echo [SUCCESS] Successfully pushed to GitHub!

echo.
echo 🎉 Deployment completed successfully!
echo ======================================
echo.
echo 📋 Next Steps:
echo 1. Visit: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. Share the repository with others
echo 3. Set up deployment platforms (see DEPLOYMENT_GUIDE.md)
echo 4. Configure environment variables
echo 5. Start testing the trading bots!
echo.
echo 🚀 Quick Deploy Options:
echo - Heroku: heroku create ^&^& git push heroku main
echo - Railway: Connect repository at railway.app
echo - Render: Connect repository at render.com
echo - Vercel: Import repository at vercel.com
echo.
echo 📚 Documentation:
echo - README.md - Main documentation
echo - DEPLOYMENT_GUIDE.md - Detailed deployment instructions
echo - ALGORITHMIC_TRADING_README.md - Trading bot documentation
echo.
echo 🤝 Community:
echo - Create GitHub Issues for bugs
echo - Start GitHub Discussions for questions
echo - Share your experience with the community
echo.
echo [SUCCESS] Happy trading! 🤖📈
echo.

REM Optional: Open GitHub repository in browser
set /p OPEN_BROWSER="Would you like to open the GitHub repository in your browser? (y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
)

pause
