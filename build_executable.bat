@echo off
echo ========================================
echo    BUILDING TRADING BOT PRO EXECUTABLE
echo ========================================
echo.

echo 🚀 This will create a standalone executable that anyone can run!
echo.

echo 📋 Available build options:
echo 1. Installer (.exe with setup wizard)
echo 2. Portable (.exe that runs anywhere)
echo 3. Both (recommended)
echo.

set /p choice="Choose build type (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🔨 Building Windows Installer...
    echo 📦 This creates a professional installer with setup wizard
    echo.
    npm run build-win
) else if "%choice%"=="2" (
    echo.
    echo 🔨 Building Portable Executable...
    echo 📦 This creates a single .exe file that runs anywhere
    echo.
    npm run build-portable
) else if "%choice%"=="3" (
    echo.
    echo 🔨 Building Both Installer and Portable...
    echo 📦 This creates both versions for maximum compatibility
    echo.
    npm run build
) else (
    echo.
    echo ❌ Invalid choice. Please run again and select 1-3.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed!
echo.
echo 📁 Your executable(s) are in the 'dist' folder:
echo.
if exist "dist\Trading Bot Pro Setup.exe" (
    echo 📦 Installer: Trading Bot Pro Setup.exe
    echo    - Professional installer with setup wizard
    echo    - Creates desktop and start menu shortcuts
    echo    - Installs to Program Files
    echo.
)
if exist "dist\TradingBotPro-Portable.exe" (
    echo 📦 Portable: TradingBotPro-Portable.exe
    echo    - Single executable file
    echo    - Runs from any location (USB, cloud, etc.)
    echo    - No installation required
    echo.
)
echo.
echo 🎯 You can now share these files with anyone!
echo    They will work on any Windows computer without needing Node.js.
echo.
pause






