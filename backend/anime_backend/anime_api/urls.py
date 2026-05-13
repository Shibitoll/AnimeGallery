from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'animes', views.AnimeViewSet, basename='anime')

urlpatterns = [
    # Кастомні ендпоінти СТАВИМО ВИЩЕ за router
    path('animes/recommended/', views.recommended_anime, name='recommended_anime'),
    path('proxy/', views.anihub_proxy, name='anihub_proxy'),
    
    # Стандартний DRF router (включає /animes/ і /animes/<id>/)
    path('', include(router.urls)),
]