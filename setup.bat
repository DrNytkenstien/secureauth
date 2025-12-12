@echo off
REM SecureAuth Backend - Quick Start Script for Windows
REM This script sets up the backend project for development

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          SecureAuth Backend - Quick Start Setup           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%
echo.

echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ⚙️  Creating .env file...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists. Skipping creation.
) else (
    REM Copy .env.example to .env
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ✅ .env file created from .env.example
        echo    Please edit .env with your configuration
    ) else (
        echo ⚠️  .env.example not found
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    Setup Complete! 🎉                      ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  Next Steps:                                              ║
echo ║  1. Configure .env with your settings                     ║
echo ║  2. Start development server: npm run dev                 ║
echo ║  3. Server will run on http://localhost:5000              ║
echo ║                                                            ║
echo ║  Documentation:                                           ║
echo ║  - README.md              - API Documentation             ║
echo ║  - API_TESTING.md         - Testing Examples              ║
echo ║  - PRODUCTION_CHECKLIST.md - Production Deployment        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion
set /p start="Would you like to start the development server now? (y/n): "

if /i "!start!"=="y" (
    echo.
    echo 🚀 Starting development server...
    echo.
    call npm run dev
) else (
    echo.
    echo Run 'npm run dev' when you're ready to start the server.
    echo.
    pause
)
