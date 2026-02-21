@echo off
title Puffin ERP Development Environment

echo 🚀 Starting Puffin ERP Development Environment...

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm found

REM Start Backend
echo 🔧 Starting Backend Server...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Backend .env file not found. Using default configuration.
)

REM Start backend in development mode
start "Backend Server" cmd /k "npm run dev"
echo ✅ Backend server starting...

cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🎨 Starting Frontend Server...
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Frontend .env file not found. Using default configuration.
)

REM Start frontend in development mode
start "Frontend Server" cmd /k "npm run dev"
echo ✅ Frontend server starting...

cd ..

echo.
echo 🎉 Puffin ERP is starting up!
echo 📊 Backend API: http://localhost:5050
echo 🌐 Frontend App: http://localhost:3003
echo 📚 API Documentation: http://localhost:5050/health
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause