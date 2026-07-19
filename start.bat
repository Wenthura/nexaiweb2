@echo off
title Grahachara - Dev Server
cd /d "%~dp0"

echo ============================================
echo   Grahachara - starting local dev server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not on PATH.
  echo Download it from https://nodejs.org  then run this again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo First run - installing dependencies, this may take a minute...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. See the messages above.
    pause
    exit /b 1
  )
  echo.
)

echo Launching Astro dev server and opening your browser...
echo Leave this window open while you work. Press Ctrl+C to stop.
echo.

call npm run dev -- --open

pause
