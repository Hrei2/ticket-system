@echo off
echo Starting Ticket System...
echo.

cd /d "%~dp0"

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend
    pause
    exit /b 1
)

echo.
echo Starting backend server...
cd ../backend
start "Ticket System Backend" cmd /k "set RESEND_API_KEY=re_7ZVFQ9mn_7Afk9byav3wT941SW33F5F7n && node server.js"

echo.
echo Ticket System is starting up...
echo Backend server should be available at: http://localhost:3001
echo.
echo Press any key to close this window...
pause >nul