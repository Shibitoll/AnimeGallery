@echo off
setlocal enabledelayedexpansion

:: Set window title
title AnimeGallery - Full Project Verification

echo ============================================================
echo           STARTING PROJECT COMPREHENSIVE CHECK
echo ============================================================

:: --- STEP 1: BACKEND (Ruff) ---
echo [1/4] Running Python Linting (Ruff)...
cd backend
call ruff check . --fix
if %ERRORLEVEL% NEQ 0 (
    set "STAGE=Ruff (Backend)"
    cd ..
    goto error
)

:: --- STEP 2: BACKEND (Mypy) ---
echo [2/4] Running Static Type Check (Mypy)...
:: Entering the subfolder where manage.py and project code live
cd anime_backend
set PYTHONPATH=%PYTHONPATH%;%CD%
call mypy .
if %ERRORLEVEL% NEQ 0 (
    set "STAGE=Mypy (Backend)"
    cd ..\..
    goto error
)
:: Return to root (out of anime_backend and backend)
cd ..\..

:: --- STEP 3: FRONTEND (ESLint) ---
echo [3/4] Running React Linting (ESLint)...
:: We are already in root, where package.json and eslint.config.js are
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    set "STAGE=ESLint (Frontend)"
    goto error
)

:: --- STEP 4: FRONTEND (Build) ---
echo [4/4] Running Test Build (Vite/TS)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    set "STAGE=Build/TS (Frontend)"
    goto error
)

:: --- SUCCESS ---
echo.
echo ============================================================
echo [SUCCESS] All verification stages passed!
echo You can safely COMMIT and PUSH your changes.
echo ============================================================
pause
exit /b 0

:error
echo.
echo ============================================================
echo [FAILED] Stage: !STAGE! failed.
echo Please fix the issues reported above.
echo ============================================================
pause
exit /b 1