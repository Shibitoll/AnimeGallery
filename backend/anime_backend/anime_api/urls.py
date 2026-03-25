from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnimeViewSet

router = DefaultRouter()
router.register(r'animes', AnimeViewSet, basename='anime')

urlpatterns = [
    path('', include(router.urls)),
]