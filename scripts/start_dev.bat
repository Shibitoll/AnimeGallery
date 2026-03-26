@echo off
echo ===================================================
echo   Starting AnimeGallery Development Environment
echo ===================================================

:: Використовуємо ..\ щоб вказати правильний шлях з папки scripts
echo Starting Django Backend...
start "AnimeGallery Backend" cmd /k "cd ..\backend\anime_backend && ..\venv\Scripts\activate && python manage.py runserver"

echo Starting Vite Frontend...
start "AnimeGallery Frontend" cmd /k "cd ..\ && npm run dev"

echo ✅ Servers are starting in separate windows. You can close this window.
pause >nul