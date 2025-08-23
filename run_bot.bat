@echo off
echo ========================================
echo    TRADING BOT LAUNCHER
echo ========================================
echo.

echo Choose a mode to run:
echo 1. Demo Mode (Recommended for beginners)
echo 2. Simulation Mode (No API keys required)
echo 3. Backtesting Mode
echo 4. Live Trading (DANGEROUS!)
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting Demo Mode...
    echo ⚠️  Make sure you have set up your .env file with API keys!
    echo.
    node example.js demo
) else if "%choice%"=="2" (
    echo.
    echo Starting Simulation Mode...
    echo ⚠️  No API keys required - pure simulation
    echo.
    node demo_mode.js
) else if "%choice%"=="3" (
    echo.
    echo Starting Backtesting Mode...
    echo.
    node example.js backtest
) else if "%choice%"=="4" (
    echo.
    echo ⚠️  WARNING: LIVE TRADING MODE ⚠️
    echo This will trade with REAL MONEY!
    echo.
    set /p confirm="Are you sure? Type 'YES' to continue: "
    if "%confirm%"=="YES" (
        echo Starting Live Trading...
        node example.js live
    ) else (
        echo Live trading cancelled.
    )
) else if "%choice%"=="5" (
    echo Exiting...
    exit
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Press any key to exit...
pause >nul
