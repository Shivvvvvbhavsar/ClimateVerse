@echo off
title ClimateVerse - Stop
echo Stopping ClimateVerse...
echo.

where docker >nul 2>nul
if %errorlevel% == 0 (
    docker compose down
    echo [OK] Docker containers stopped.
)

echo.
echo If you started ClimateVerse in local mode, close the
echo "ClimateVerse Backend" and "ClimateVerse Frontend" windows
echo directly, or run:
echo.
echo   taskkill /FI "WindowTitle eq ClimateVerse Backend*" /T /F
echo   taskkill /FI "WindowTitle eq ClimateVerse Frontend*" /T /F
echo.
pause
