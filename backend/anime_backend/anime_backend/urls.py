"""
Головний модуль маршрутизації (URLConf) проєкту anime_backend.

Цей файл є основною точкою входу для всіх HTTP-запитів до вашого бекенду. 
Він розподіляє вхідні адреси (URL) між панеллю адміністратора, додатком 
для роботи з каталогом аніме (`anime_api`) та функціями користувачів (`user_api`).
"""
from django.conf import settings  # Імпортуємо наше представлення
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from user_api.views import RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('anime_api.urls')),
    path('api/register/', RegisterView.as_view(), name='auth_register'),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'), # Генерація файлу OpenAPI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), # Інтерактивний інтерфейс
    path('api/users/', include('user_api.urls')),
]
"""
list: Загальний список маршрутів (URL-адрес) проєкту.

Включає:
- `/admin/` — Панель адміністратора (керування БД).
- `/api/` — Базовий шлях для всіх ендпоінтів `anime_api` (наприклад, `/api/animes/`).
- `/api/register/` — Ендпоінт для створення нового облікового запису користувача.
- `/api/schema/` — Ендпоінт для завантаження сирої OpenAPI 3.0 специфікації (YAML/JSON).
- `/api/docs/` — Інтерактивна документація Swagger UI для тестування API.
"""

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns