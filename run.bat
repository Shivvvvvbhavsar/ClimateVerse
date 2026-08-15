@echo off
setlocal enabledelayedexpansion
title ClimateVerse - Running
echo ============================================================
echo   ClimateVerse - Simulate Today. Protect Tomorrow.
echo ============================================================
echo.

where docker >nul 2>nul
if %errorlevel% == 0 (
    docker info >nul 2>nul
    if !errorlevel! == 0 (
        echo [OK] Docker is available and running.
        echo Starting ClimateVerse with Docker Compose...
        echo.
        if not exist ".env" copy ".env.example" ".env" >nul
        docker compose up --build -d

        echo.
        echo Waiting for backend to become healthy...
        set /a tries=0
        :waitloop
        set /a tries+=1
        curl -s http://localhost:8000/health >nul 2>nul
        if !errorlevel! == 0 goto ready
        if !tries! GEQ 30 goto timeout
        timeout /t 2 >nul
        goto waitloop

        :ready
        echo [OK] Backend is healthy.
        goto printurls

        :timeout
        echo [WARN] Backend did not report healthy in time. It may still be starting.
        echo         Check with: docker compose logs -f backend
        goto printurls
    )
    echo [WARN] Docker is installed but not running. Please start Docker Desktop.
    echo        Falling back to local (non-Docker) mode...
    echo.
)

echo Starting ClimateVerse locally (no Docker)...
echo.

if not exist "backend\.venv" (
    echo [ERROR] Backend virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

start "ClimateVerse Backend" cmd /k "cd backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 5 >nul
start "ClimateVerse Frontend" cmd /k "cd frontend && npm run dev"

:printurls
echo.
echo ============================================================
echo   ClimateVerse is running!
echo.
echo   Frontend:   http://localhost:3000
echo   Backend:    http://localhost:8000
echo   API docs:   http://localhost:8000/docs
echo.
echo   Demo login: demo@climateverse.local / ClimateVerse@123
echo ============================================================
echo.
echo Opening browser...
timeout /t 3 >nul
start http://localhost:3000
echo.
echo Press any key to close this window (services keep running in the background).
pause >nul
