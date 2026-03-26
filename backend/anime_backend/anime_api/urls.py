"""
Модуль маршрутизації (URL routing) для додатка anime_api.

Використовує Django REST Framework (DRF) `DefaultRouter` для автоматичної 
генерації RESTful маршрутів (GET, POST, PUT, PATCH, DELETE) на основі `AnimeViewSet`.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AnimeViewSet

router = DefaultRouter()
"""
DefaultRouter: Об'єкт маршрутизатора DRF.

Автоматично створює стандартні шляхи для CRUD-операцій. 
Наприклад: `/animes/` для списку та `/animes/{id}/` для конкретного запису.
"""
router.register(r'animes', AnimeViewSet, basename='anime')

urlpatterns = [
    path('', include(router.urls)),
]
"""
list: Список маршрутів URL для додатка. 

Підключає всі згенеровані роутером адреси до конфігурації URL. 
Префікс шляху залежатиме від того, як цей файл підключено в головному `urls.py` проєкту.
"""