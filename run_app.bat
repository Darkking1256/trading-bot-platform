@echo off
echo ========================================
echo    TRADING BOT APPLICATION LAUNCHER
echo ========================================
echo.

echo 🚀 Starting Trading Bot Application...
echo.

echo 📋 Available modes:
echo 1. Demo Mode (Simulation - No API keys needed)
echo 2. Live Mode (Real trading - Requires API keys)
echo 3. Backtest Mode (Historical testing)
echo 4. Multi-Strategy Mode
echo.

set /p choice="Choose mode (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🎮 Starting Demo Mode...
    echo 📈 Simulating real market conditions
    echo ⚠️ No real money involved
    echo.
    npm run demo
) else if "%choice%"=="2" (
    echo.
    echo 💰 Starting Live Mode...
    echo ⚠️ WARNING: This will use real money!
    echo 📋 Make sure you have API keys configured
    echo.
    pause
    npm run live
) else if "%choice%"=="3" (
    echo.
    echo 📊 Starting Backtest Mode...
    echo 📈 Testing strategy on historical data
    echo.
    npm run backtest
) else if "%choice%"=="4" (
    echo.
    echo 🔄 Starting Multi-Strategy Mode...
    echo 📈 Running multiple strategies simultaneously
    echo.
    npm run multi
) else (
    echo.
    echo ❌ Invalid choice. Please run again and select 1-4.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Application finished!
echo.
pause



