@echo off
title AuraTalent Project Auto-Runner
echo ==================================================
echo   AURA-TALENT PROJECT AUTO-RUNNER (WINDOWS)
echo ==================================================
echo.

:: Step 1: Check if node_modules folder exists. If not, install dependencies.
if not exist "node_modules\" (
    echo [SYSTEM] "node_modules" is missing. Installing required dependencies...
    echo [SYSTEM] Please wait, this might take a minute...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies. Is Node.js installed on your computer?
        pause
        exit /b %errorlevel%
    )
) else (
    echo [SYSTEM] Dependencies are already installed. Skipping installation.
)

:: Step 2: Start the Vite / React Development Server
echo.
echo [SYSTEM] Starting your local web server...
echo ==================================================
echo.
call npm run dev

:: Keep terminal window open if the server crashes or stops
pause