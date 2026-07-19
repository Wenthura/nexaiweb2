@echo off
title Grahachara - Build and Preview
cd /d "%~dp0"

echo ============================================
echo   Grahachara - production build + preview
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not on PATH.
  echo Download it from https://nodejs.org  then run this again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

echo Building the production site into dist\ ...
echo.
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] Build failed. See the messages above.
  pause
  exit /b 1
)

echo.
echo Serving the built site and opening your browser...
echo Leave this window open. Press Ctrl+C to stop.
echo.
call npm run preview -- --open

pause
