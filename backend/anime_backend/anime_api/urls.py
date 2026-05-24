from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'animes', views.AnimeViewSet, basename='anime')

urlpatterns = [
    path('animes/recommended/', views.recommended_anime, name='recommended_anime'),
    path('animes/user-comments-stats/', views.user_comment_stats, name='user_comment_stats'),
    path('proxy/', views.anihub_proxy, name='anihub_proxy'),
    
    path('', include(router.urls)),
]