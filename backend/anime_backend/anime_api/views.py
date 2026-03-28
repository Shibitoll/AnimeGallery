"""
Модуль представлень (views) для додатка anime_api.

Містить логіку обробки HTTP-запитів до API. Використовує високорівневі 
класи (ViewSets) з Django REST Framework для швидкої реалізації CRUD-операцій 
без необхідності писати кожен метод (GET, POST, PUT, DELETE) окремо.
"""
import logging

from django_filters.rest_framework import DjangoFilterBackend
from pyinstrument import Profiler
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Anime
from .serializers import AnimeSerializer

logger = logging.getLogger('anime_api')


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
    def list(self, request, *args, **kwargs):
        """
        Перевизначений метод отримання списку для додавання логування.
        """
        # Логуємо факт запиту (з фільтрами)
        logger.debug(f"Запит на отримання списку аніме. Параметри: {request.query_params}")
        
        response = super().list(request, *args, **kwargs)
        
        logger.info(f"Успішно віддано список з {len(response.data)} аніме.")
        return response

    def create(self, request, *args, **kwargs):
        """
        Перевизначений метод створення для логування успіху та помилок валідації.
        """
        logger.debug(f"Спроба створити нове аніме. Дані: {request.data}")
        
        try:
            # Викликаємо стандартний метод DRF для створення
            response = super().create(request, *args, **kwargs)
            logger.info(f"Успішно створено аніме: '{response.data.get('title')}' (ID: {response.data.get('id')})")
            return response
            
        except ValidationError as e:
            # ЛОГУЄМО ПОМИЛКУ ВАЛІДАЦІЇ (WARNING)
            logger.warning(f"Помилка валідації при створенні аніме.Надіслані дані: {request.data}. Помилки: {e.detail}")
            # Прокидаємо помилку далі, щоб DRF відповів клієнту статусом 400
            raise e

    def destroy(self, request, *args, **kwargs):
        """
        Перевизначений метод видалення для створення аудиту критичних операцій.
        """
        # Отримуємо об'єкт до того, як він буде видалений, щоб залогувати його назву
        instance = self.get_object()
        anime_title = instance.title
        anime_id = instance.id
        
        logger.info(f"Ініційовано видалення аніме '{anime_title}' (ID: {anime_id})")
        
        # Виконуємо видалення
        response = super().destroy(request, *args, **kwargs)
        
        logger.info(f"Аніме '{anime_title}' було остаточно видалено з бази даних.")
        return response
    
def list(self, request, *args, **kwargs):
        """
        Перевизначений метод отримання списку (Логування + Профілювання).
        """
        # Логування з Лабораторної 7
        logger.debug(f"Запит на отримання списку аніме. Параметри: {request.query_params}")
        
        # Запуск профілювальника з Лабораторної 8
        profiler = Profiler(interval=0.001)
        profiler.start()
        
        # Основна логіка віддачі списку
        response = super().list(request, *args, **kwargs)
        
        # Зупинка профілювальника та вивід у консоль
        profiler.stop()
        print(profiler.output_text(unicode=True, color=True))
        
        # Логування успішного результату
        logger.info(f"Успішно віддано список з {len(response.data)} аніме.")
        
        return response