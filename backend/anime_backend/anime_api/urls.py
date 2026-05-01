"""
Модуль маршрутизації (URL routing) для додатка anime_api.

Використовує Django REST Framework (DRF) `DefaultRouter` для автоматичної 
генерації RESTful маршрутів (GET, POST, PUT, PATCH, DELETE) на основі `AnimeViewSet`.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
"""
DefaultRouter: Об'єкт маршрутизатора DRF.

Автоматично створює стандартні шляхи для CRUD-операцій. 
Наприклад: `/animes/` для списку та `/animes/{id}/` для конкретного запису.
"""
router.register(r'animes', views.AnimeViewSet, basename='anime')

urlpatterns = [
    path('', include(router.urls)),

    # ТРИ маршрути для онлайн-каталогу
    path('streaming/top-airing/', views.get_top_airing, name='top_airing'),  # Новинки
    path('streaming/popular/', views.get_popular_anime, name='popular_anime'), # Популярне
    path('streaming/search/', views.search_anime, name='search-anime'),
    
    path('streaming/info/<str:anime_id>/', views.get_anime_info, name='anime_info'),
    path('streaming/watch/<path:episode_id>/', views.get_streaming_links, name='streaming_links'),
]
"""
list: Список маршрутів URL для додатка. 

Підключає всі згенеровані роутером адреси до конфігурації URL. 
Префікс шляху залежатиме від того, як цей файл підключено в головному `urls.py` проєкту.
"""