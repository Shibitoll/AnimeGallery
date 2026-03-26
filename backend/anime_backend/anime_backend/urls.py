"""
Головний модуль маршрутизації (URLConf) проєкту anime_backend.

Цей файл є основною точкою входу для всіх HTTP-запитів до вашого бекенду. 
Він розподіляє вхідні адреси (URL) між панеллю адміністратора, додатком 
для роботи з каталогом аніме (`anime_api`) та функціями користувачів (`user_api`).
"""
from django.contrib import admin
from django.urls import include, path
from user_api.views import RegisterView  # Імпортуємо наше представлення

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('anime_api.urls')),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
]
"""
list: Загальний список маршрутів (URL-адрес) проєкту.

Включає:
- `/admin/` — Панель адміністратора (керування БД).
- `/api/` — Базовий шлях для всіх ендпоінтів `anime_api` (наприклад, `/api/animes/`).
- `/api/register/` — Ендпоінт для створення нового облікового запису користувача.
"""