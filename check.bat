@echo off
setlocal enabledelayedexpansion

:: Налаштування кольорів (6 - жовтий, 2 - зелений, 4 - червоний)
title AnimeGallery - Комплексна перевірка проєкту

echo ============================================================
echo           ЗАПУСК КОМПЛЕКСНОЇ ПЕРЕВІРКИ ПРОЄКТУ
echo ============================================================

:: --- КРОК 1: БЕКЕНД ---
echo [1/4] Перевірка стилю та логіки Python (Ruff)...
cd backend
call ruff check . --fix
if %ERRORLEVEL% NEQ 0 (set "STAGE=Ruff (Backend)"; goto error)

echo [2/4] Статична типізація Python (Mypy)...
call mypy .
if %ERRORLEVEL% NEQ 0 (set "STAGE=Mypy (Backend)"; goto error)
cd ..

:: --- КРОК 2: ФРОНТЕНД ---
echo [3/4] Аналіз коду React (ESLint)...
cd frontend
call npm run lint
if %ERRORLEVEL% NEQ 0 (set "STAGE=ESLint (Frontend)"; goto error)

echo [4/4] Тестова збірка та типізація (Vite/Build)...
call npm run build
if %ERRORLEVEL% NEQ 0 (set "STAGE=Build/TS (Frontend)"; goto error)
cd ..

:: --- УСПІХ ---
echo.
echo ============================================================
echo [УСПІХ] Усі етапи перевірки пройдено успішно!
echo Можна безпечно робити commit та push.
echo ============================================================
pause
exit /b 0

:error
echo.
echo ============================================================
echo [ПОМИЛКА] Етап: !STAGE! завершився невдало.
echo Будь ласка, виправте зауваження лінтера вище.
echo ============================================================
if exist ..\package.json (cd ..)
pause
exit /b 1