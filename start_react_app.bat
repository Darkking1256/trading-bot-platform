@echo off
echo Starting Trading Platform React Application...
echo.

echo Installing dependencies...
call npm install
cd client
call npm install
cd ..

echo.
echo Starting backend server on port 5000...
start "Backend Server" cmd /k "npm run server"

echo.
echo Starting React development server on port 3000...
start "React Client" cmd /k "cd client && npm start"

echo.
echo Trading Platform is starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Account:
echo Username: demo
echo Password: password123
echo.
pause
