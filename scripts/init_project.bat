@echo off
echo ===================================================
echo   Initializing AnimeGallery Project...
echo ===================================================

echo [1/3] Setting up Backend Environment...
:: Виходимо зі scripts і йдемо в backend
cd ..\backend
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
)
call venv\Scripts\activate
cd anime_backend
echo Installing Python dependencies...
pip install django djangorestframework django-cors-headers django-filter drf-spectacular pdoc ruff gunicorn
echo Running database migrations...
python manage.py migrate

echo.
echo [2/3] Setting up Frontend Environment...
:: Повертаємося в корінь проєкту
cd ..\..\
echo Installing Node modules...
npm install

echo.
echo ===================================================
echo All dependencies installed successfully!
echo ===================================================
pause