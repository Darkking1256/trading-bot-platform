@echo off
echo ========================================
echo    CREATING STANDALONE TRADING BOT
echo ========================================
echo.

echo 🚀 Creating standalone executable package...
echo.

REM Create output directory
if not exist "standalone" mkdir standalone
if not exist "standalone\TradingBotPro" mkdir standalone\TradingBotPro

echo 📁 Copying application files...

REM Copy main application files
copy "main.js" "standalone\TradingBotPro\"
copy "index.html" "standalone\TradingBotPro\"
copy "styles.css" "standalone\TradingBotPro\"
copy "renderer.js" "standalone\TradingBotPro\"
copy "package.json" "standalone\TradingBotPro\"

REM Copy assets
if not exist "standalone\TradingBotPro\assets" mkdir standalone\TradingBotPro\assets
copy "assets\*" "standalone\TradingBotPro\assets\" 2>nul

REM Copy other important files
copy "TradingBot.js" "standalone\TradingBotPro\" 2>nul
copy "config.js" "standalone\TradingBotPro\" 2>nul
copy "example.js" "standalone\TradingBotPro\" 2>nul
copy "demo_mode.js" "standalone\TradingBotPro\" 2>nul

REM Copy directories
if exist "strategies" xcopy "strategies" "standalone\TradingBotPro\strategies\" /E /I /Y
if exist "brokers" xcopy "brokers" "standalone\TradingBotPro\brokers\" /E /I /Y

echo 📦 Creating launcher script...

REM Create launcher script
echo @echo off > "standalone\TradingBotPro\TradingBotPro.bat"
echo echo ======================================== >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo    TRADING BOT PRO - STANDALONE VERSION >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo ======================================== >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo 🚀 Starting Trading Bot Pro... >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo 📋 This is a standalone version that requires Node.js >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo    to be installed on the target computer. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo ⚠️  Make sure Node.js is installed from: https://nodejs.org/ >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo if not exist "node_modules" ^( >> "standalone\TradingBotPro\TradingBotPro.bat"
echo     echo 📦 Installing dependencies... >> "standalone\TradingBotPro\TradingBotPro.bat"
echo     npm install >> "standalone\TradingBotPro\TradingBotPro.bat"
echo     echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo ^) >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo 🎯 Launching Trading Bot Pro... >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo npm start >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo. >> "standalone\TradingBotPro\TradingBotPro.bat"
echo echo ✅ Application closed! >> "standalone\TradingBotPro\TradingBotPro.bat"
echo pause >> "standalone\TradingBotPro\TradingBotPro.bat"

REM Create README for standalone version
echo # Trading Bot Pro - Standalone Version > "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo ## 🚀 How to Use >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo 1. Make sure Node.js is installed on your computer >> "standalone\TradingBotPro\README.txt"
echo    Download from: https://nodejs.org/ >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo 2. Double-click "TradingBotPro.bat" to start the application >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo 3. The first time you run it, it will install dependencies automatically >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo 4. Enjoy your professional trading bot! >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo ## 📋 Features >> "standalone\TradingBotPro\README.txt"
echo - Professional desktop interface >> "standalone\TradingBotPro\README.txt"
echo - Real-time trading simulation >> "standalone\TradingBotPro\README.txt"
echo - Multiple trading strategies >> "standalone\TradingBotPro\README.txt"
echo - Performance tracking >> "standalone\TradingBotPro\README.txt"
echo - Risk management tools >> "standalone\TradingBotPro\README.txt"
echo. >> "standalone\TradingBotPro\README.txt"
echo ## ⚠️ Requirements >> "standalone\TradingBotPro\README.txt"
echo - Windows 10 or later >> "standalone\TradingBotPro\README.txt"
echo - Node.js installed >> "standalone\TradingBotPro\README.txt"
echo - Internet connection for live trading >> "standalone\TradingBotPro\README.txt"

REM Create installation script
echo @echo off > "standalone\TradingBotPro\install.bat"
echo echo ======================================== >> "standalone\TradingBotPro\install.bat"
echo echo    TRADING BOT PRO - INSTALLATION >> "standalone\TradingBotPro\install.bat"
echo echo ======================================== >> "standalone\TradingBotPro\install.bat"
echo echo. >> "standalone\TradingBotPro\install.bat"
echo echo 📦 Installing Trading Bot Pro dependencies... >> "standalone\TradingBotPro\install.bat"
echo echo. >> "standalone\TradingBotPro\install.bat"
echo npm install >> "standalone\TradingBotPro\install.bat"
echo echo. >> "standalone\TradingBotPro\install.bat"
echo echo ✅ Installation completed! >> "standalone\TradingBotPro\install.bat"
echo echo. >> "standalone\TradingBotPro\install.bat"
echo echo 🎯 You can now run TradingBotPro.bat to start the application >> "standalone\TradingBotPro\install.bat"
echo echo. >> "standalone\TradingBotPro\install.bat"
echo pause >> "standalone\TradingBotPro\install.bat"

REM Create ZIP file
echo 📦 Creating ZIP package...
powershell -command "Compress-Archive -Path 'standalone\TradingBotPro\*' -DestinationPath 'standalone\TradingBotPro-Standalone.zip' -Force"

echo.
echo ✅ Standalone package created successfully!
echo.
echo 📁 Your standalone application is in:
echo    standalone\TradingBotPro\
echo.
echo 📦 ZIP package created:
echo    standalone\TradingBotPro-Standalone.zip
echo.
echo 🎯 To use on another computer:
echo    1. Extract the ZIP file
echo    2. Install Node.js from https://nodejs.org/
echo    3. Run TradingBotPro.bat
echo.
echo 📋 Files included:
echo    - TradingBotPro.bat (launcher)
echo    - install.bat (dependency installer)
echo    - README.txt (instructions)
echo    - All application files
echo.
pause


