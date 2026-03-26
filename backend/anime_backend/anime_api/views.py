"""
Модуль представлень (views) для додатка anime_api.

Містить логіку обробки HTTP-запитів до API. Використовує високорівневі 
класи (ViewSets) з Django REST Framework для швидкої реалізації CRUD-операцій 
без необхідності писати кожен метод (GET, POST, PUT, DELETE) окремо.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Anime
from .serializers import AnimeSerializer


class AnimeViewSet(viewsets.ModelViewSet):
    """
    ViewSet для керування даними моделі Anime.
    
    Забезпечує повний набір стандартних дій (list, create, retrieve, update, destroy).
    Додатково налаштований для підтримки:
    - Точної фільтрації (за статусами, роками, студіями).
    - Текстового пошуку (за назвою, описом, жанрами).
    - Сортування (за рейтингом, роком, назвою).
    """
    queryset = Anime.objects.all()
    """QuerySet: Базовий набір даних, що включає всі об'єкти аніме з бази даних."""
    serializer_class = AnimeSerializer
    """Serializer: Серіалізатор для перетворення даних аніме у JSON."""

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    """list: Набір бекендів, що активують функціонал фільтрації, пошуку та сортування у DRF."""

    # Фільтрація за категоріями (корисно для вкладок)
    filterset_fields = ['is_favorite', 'in_watchlist', 'year', 'studio']
    """list: Поля для точної фільтрації (наприклад, `/api/animes/?is_favorite=true`)."""
    # Пошук за текстом
    search_fields = ['title', 'description', 'genres']
    """list: Поля для повнотекстового пошуку (наприклад, `/api/animes/?search=Naruto`)."""
    # Сортування
    ordering_fields = ['rating', 'year', 'title']
    """list: Поля, за якими можна сортувати результати (наприклад, `/api/animes/?ordering=-rating`)."""