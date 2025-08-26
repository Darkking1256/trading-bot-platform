@echo off
echo ========================================
echo    TRADING BOT INSTALLER
echo ========================================
echo.

echo This will install all dependencies for the trading bot.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version and restart your computer.
    echo.
    echo After installing Node.js, run this installer again.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo Version: 
node --version
echo.

echo Installing dependencies...
echo.

REM Install dependencies
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo Installing additional required packages...
npm install axios ws technicalindicators moment uuid dotenv
if %errorlevel% neq 0 (
    echo ❌ Failed to install additional packages!
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed successfully!
echo.

echo Next steps:
echo 1. Get a demo account from OANDA: https://www.oanda.com/
echo 2. Create a .env file with your API keys
echo 3. Run the bot with: run_bot.bat
echo.

echo Would you like to create a sample .env file now? (y/n)
set /p create_env="Enter your choice: "

if /i "%create_env%"=="y" (
    echo.
    echo Creating sample .env file...
    echo # OANDA Demo Account Configuration > .env
    echo OANDA_API_KEY=your_oanda_api_key_here >> .env
    echo OANDA_ACCOUNT_ID=your_oanda_account_id_here >> .env
    echo. >> .env
    echo # Optional: FXCM Demo Account >> .env
    echo FXCM_API_KEY=your_fxcm_api_key_here >> .env
    echo FXCM_ACCOUNT_ID=your_fxcm_account_id_here >> .env
    echo.
    echo ✅ Sample .env file created!
    echo.
    echo Please edit the .env file and add your actual API keys.
    echo.
)

echo.
echo 🎉 Installation complete!
echo.
echo To start the bot:
echo 1. Double-click run_bot.bat
echo 2. Choose "Demo Mode"
echo 3. Follow the prompts
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause




