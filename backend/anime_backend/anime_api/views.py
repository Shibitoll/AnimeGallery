from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Anime
from .serializers import AnimeSerializer

class AnimeViewSet(viewsets.ModelViewSet):
    queryset = Anime.objects.all()
    serializer_class = AnimeSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Фільтрація за категоріями (корисно для вкладок)
    filterset_fields = ['is_favorite', 'in_watchlist', 'year', 'studio']
    
    # Пошук за текстом
    search_fields = ['title', 'description', 'genres']
    
    # Сортування
    ordering_fields = ['rating', 'year', 'title']