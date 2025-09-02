@echo off
echo ========================================
echo    UPLOAD TO GITHUB HELPER
echo ========================================
echo.

echo 🚀 This will help you upload your trading bot to GitHub
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/
    echo Choose the default options during installation.
    echo.
    echo After installing Git, run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

echo 📋 Steps to upload to GitHub:
echo.
echo 1. Go to https://github.com/
echo 2. Click "New repository"
echo 3. Name it: real-trading-bot
echo 4. Make it Public
echo 5. Don't initialize with README
echo 6. Click "Create repository"
echo.
echo After creating the repository, you'll get a URL like:
echo https://github.com/YOUR_USERNAME/real-trading-bot.git
echo.

set /p repo_url="Enter your GitHub repository URL: "

if "%repo_url%"=="" (
    echo ❌ Please enter a valid repository URL
    pause
    exit /b 1
)

echo.
echo 🔄 Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
)

echo.
echo 📁 Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files
    pause
    exit /b 1
)

echo.
echo 💾 Creating initial commit...
git commit -m "Initial commit: Real Trading Bot with live demo"
if %errorlevel% neq 0 (
    echo ❌ Failed to create commit
    pause
    exit /b 1
)

echo.
echo 🌿 Setting up main branch...
git branch -M main
if %errorlevel% neq 0 (
    echo ❌ Failed to set main branch
    pause
    exit /b 1
)

echo.
echo 🔗 Adding remote repository...
git remote add origin %repo_url%
if %errorlevel% neq 0 (
    echo ❌ Failed to add remote repository
    pause
    exit /b 1
)

echo.
echo 📤 Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ Failed to push to GitHub
    echo.
    echo This might be because:
    echo - You need to authenticate with GitHub
    echo - The repository URL is incorrect
    echo - You don't have permission to push
    echo.
    echo Please check your GitHub credentials and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Successfully uploaded to GitHub!
echo.
echo 🎯 Next steps:
echo 1. Go to your repository on GitHub
echo 2. Click "Settings" tab
echo 3. Scroll down to "Pages" section
echo 4. Source: Select "Deploy from a branch"
echo 5. Branch: Select "gh-pages"
echo 6. Click "Save"
echo.
echo 🌐 Your live demo will be available at:
echo https://YOUR_USERNAME.github.io/real-trading-bot/
echo.
echo 📖 For detailed instructions, see GITHUB_SETUP.md
echo.
pause







