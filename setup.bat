@echo off
setlocal enabledelayedexpansion
title ClimateVerse - Setup
echo ============================================================
echo   ClimateVerse - First-time setup
echo ============================================================
echo.

where docker >nul 2>nul
if %errorlevel% == 0 (
    echo [OK] Docker detected.
    echo.
    if not exist ".env" (
        copy ".env.example" ".env" >nul
        echo [OK] Created .env from .env.example
    ) else (
        echo [OK] .env already exists.
    )
    echo.
    echo Setup complete. Run "run.bat" to start ClimateVerse with Docker.
    echo.
    pause
    exit /b 0
)

echo [WARN] Docker was not found on this machine.
echo        Falling back to local (non-Docker) setup.
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found. Please install Python 3.11+ from python.org
    echo         and re-run this script.
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found. Please install Node.js 18+ from nodejs.org
    echo         and re-run this script.
    pause
    exit /b 1
)

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo [OK] Created .env from .env.example
)

echo.
echo [1/2] Setting up backend (Python virtual environment)...
cd backend
python -m venv .venv
call .venv\Scripts\activate.bat
pip install --upgrade pip >nul
pip install -r requirements.txt
cd ..
echo [OK] Backend dependencies installed.
echo.

echo [2/2] Setting up frontend (npm install)...
cd frontend
call npm install
cd ..
echo [OK] Frontend dependencies installed.
echo.

echo ============================================================
echo   Setup complete! Run "run.bat" to start ClimateVerse.
echo ============================================================
pause
