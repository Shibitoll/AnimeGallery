"""
Модуль представлень (views) для додатка anime_api.

Містить логіку обробки HTTP-запитів до API. Використовує високорівневі 
класи (ViewSets) з Django REST Framework для швидкої реалізації CRUD-операцій 
без необхідності писати кожен метод (GET, POST, PUT, DELETE) окремо.
"""
import logging
import time

import requests
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

# Важливо: імпортуємо і Anime і AnimeCache
from .models import Anime, AnimeCache
from .serializers import AnimeSerializer

logger = logging.getLogger('anime_api')

# Чорний список жанрів (18+, NSFW, специфічна романтика)
FORBIDDEN_GENRES = {
    'Hentai', 'Erotica', 'Ecchi', 'Boys Love', 'Girls Love', 
    'Yaoi', 'Yuri', 'Doujinshi', 'Smut'
}

#  Робота з локальною базою 

class AnimeViewSet(viewsets.ModelViewSet):
    """
    ViewSet для керування даними моделі Anime.
    
    Забезпечує повний набір стандартних дій (list, create, retrieve, update, destroy).
    Додатково налаштований для підтримки:
    - Точної фільтрації (за статусами, роками, студіями).
    - Текстового пошуку (за назвою, описом, жанрами).
    - Сортування (за рейтингом, роком, назвою).
    """
    
    # 1. ЗАХИСТ: Доступ тільки для авторизованих користувачів
    permission_classes = [IsAuthenticated]
    
    serializer_class = AnimeSerializer
    """Serializer: Серіалізатор для перетворення даних аніме у JSON."""

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    """list: Набір бекендів, що активують функціонал фільтрації, пошуку та сортування у DRF."""

    # is_watched та planned для коректної роботи вкладок у React
    filterset_fields = ['is_favorite', 'in_watchlist', 'planned', 'year', 'studio']
    search_fields = ['title', 'description', 'genres']
    ordering_fields = ['rating', 'year', 'title']

    # 2. ПЕРСОНАЛІЗАЦІЯ: Повертаємо тільки аніме, що належать поточному користувачу
    def get_queryset(self):
        """
        Повертає тільки ті аніме, власником яких є поточний користувач,
        що робить запит (автоматично береться з JWT токена).
        """
        return Anime.objects.filter(owner=self.request.user)

    # 3. ВИПРАВЛЕННЯ ПОМИЛКИ 500: Забезпечуємо, що при створенні аніме обов'язково вказується власник (owner).
    def perform_create(self, serializer):
        """
        Примусово вказуємо, що власником аніме є користувач, який робить запит.
        Викликається автоматично всередині базового методу create.
        """
        serializer.save(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Перевизначений метод отримання списку (Тільки логування, без профайлера).
        """
        logger.debug(f"Запит на отримання списку аніме. Параметри: {request.query_params}")
        
        # Викликаємо стандартний метод DRF для отримання списку
        response = super().list(request, *args, **kwargs)
        
        # Безпечний підрахунок кількості аніме (підтримує як пагінацію, так і звичайний список)
        if isinstance(response.data, dict):
            count = len(response.data.get('results', response.data))
        else:
            count = len(response.data)
        logger.info(f"Успішно віддано список з {count} аніме користувачу {request.user.username}.")
        
        return response

    def create(self, request, *args, **kwargs):
        """
        Перевизначений метод створення для логування успіху та помилок валідації.
        """
        logger.debug(f"Спроба створити нове аніме. Дані: {request.data}")
        
        try:
            # Викликаємо стандартний метод DRF для створення (який викличе наш perform_create)
            response = super().create(request, *args, **kwargs)
            logger.info(f"Успішно створено аніме: '{response.data.get('title')}' (ID: {response.data.get('id')})")
            return response
            
        except ValidationError as e:
            logger.warning(
                "Помилка валідації при створенні аніме. "
                f"Надіслані дані: {request.data}. "
                f"Помилки: {e.detail}"
            )
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
# Проксі-API для стрімінгу та каталогу

JIKAN_URL = 'https://api.jikan.moe/v4'

@require_http_methods(["GET"])
def get_top_airing(request):
    """1. НОВИНКИ: Отримує поточний сезон (Без 18+ контенту)"""
    try:
        page = request.GET.get('page', 1)
        
        # &sfw=true просить Jikan не повертати контент 18+
        response = requests.get(f"{JIKAN_URL}/seasons/now?page={page}&sfw=true", timeout=10)
        response.raise_for_status()
        
        json_response = response.json()
        data = json_response.get('data', [])
        
        pagination = json_response.get('pagination', {})
        has_next_page = pagination.get('has_next_page', False)
        current_page = pagination.get('current_page', int(page))
        total_pages = pagination.get('last_visible_page', 1)
        
        results = []
        for item in data:
            # Отримуємо список жанрів
            genres = [g.get('name') for g in item.get('genres', [])]
            age_rating = item.get('rating') or ''
            
            # ЖОРСТКИЙ ФІЛЬТР: Перевіряємо, чи є хоча б один заборонений жанр, або віковий рейтинг Rx (Hentai)
            has_forbidden_genre = any(genre in FORBIDDEN_GENRES for genre in genres)
            is_explicit = 'Rx' in age_rating
            
            if has_forbidden_genre or is_explicit:
                continue
            
            results.append({
                'id': str(item.get('mal_id')),
                'title': item.get('title_english') or item.get('title'),
                'image': item.get('images', {}).get('jpg', {}).get('large_image_url'),
                'genres': genres,
                'rating': item.get('score') or 0,
                'description': item.get('synopsis') or '',
                'year': item.get('year') or (item.get('aired', {}).get('prop', {}).get('from', {}).get('year')),
                'episodes': item.get('episodes') or 0,
            })
            
        return JsonResponse({
            'results': results,
            'hasNextPage': has_next_page,
            'currentPage': current_page,
            'totalPages': total_pages
        }, safe=False)
        
    except requests.RequestException as e:
        return JsonResponse({'error': 'Failed to fetch top airing', 'details': str(e)}, status=502)


@require_http_methods(["GET"])
def get_popular_anime(request):
    """2. ПОПУЛЯРНІ: Отримує популярні за весь час (Без 18+ контенту)"""
    try:
        page = request.GET.get('page', 1)
        
        # &sfw=true
        response = requests.get(f"{JIKAN_URL}/top/anime?filter=bypopularity&page={page}&sfw=true", timeout=10)
        response.raise_for_status()
        
        json_response = response.json()
        data = json_response.get('data', [])
        
        pagination = json_response.get('pagination', {})
        has_next_page = pagination.get('has_next_page', False)
        current_page = pagination.get('current_page', int(page))
        total_pages = pagination.get('last_visible_page', 1)
        
        results = []
        for item in data:
            genres = [g.get('name') for g in item.get('genres', [])]
            age_rating = item.get('rating') or ''
            
            # ЖОРСТКИЙ ФІЛЬТР
            has_forbidden_genre = any(genre in FORBIDDEN_GENRES for genre in genres)
            is_explicit = 'Rx' in age_rating
            
            if has_forbidden_genre or is_explicit:
                continue # ПРОПУСКАЄМО
            
            results.append({
                'id': str(item.get('mal_id')),
                'title': item.get('title_english') or item.get('title'),
                'image': item.get('images', {}).get('jpg', {}).get('large_image_url'),
                'genres': genres,
                'rating': item.get('score') or 0,
                'description': item.get('synopsis') or '',
                'year': item.get('year') or (item.get('aired', {}).get('prop', {}).get('from', {}).get('year')),
                'episodes': item.get('episodes') or 0,
            })
            
        return JsonResponse({
            'results': results,
            'hasNextPage': has_next_page,
            'currentPage': current_page,
            'totalPages': total_pages
        }, safe=False)
        
    except requests.RequestException as e:
        return JsonResponse({'error': 'Failed to fetch popular', 'details': str(e)}, status=502)


@require_http_methods(["GET"])
def get_anime_info(request, anime_id):
    """Повертає інформацію про аніме + список епізодів. Включає захист від лімітів API (Rate Limiting)."""
    try:
        cached_anime = AnimeCache.objects.get(anime_id=anime_id)
        if not cached_anime.is_stale():
            return JsonResponse(cached_anime.data, safe=False)
    except AnimeCache.DoesNotExist:
        cached_anime = None

    # Функція для безпечного запиту з повторними спробами (Retry logic)
    def safe_jikan_request(url, max_retries=3):
        for attempt in range(max_retries):
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 429: # Too Many Requests
                    logger.warning(f"Jikan API Rate Limit! Чекаємо 2 секунди... (Спроба {attempt+1}/{max_retries})")
                    time.sleep(2) # Чекаємо довше перед повтором
                    continue
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    logger.error(f"Помилка запиту до Jikan ({url}): {str(e)}")
                    return None
                time.sleep(1) # Невелика пауза перед іншими помилками
        return None

    try:
        # 1. Запит основної інфи (використовуємо безпечну функцію)
        info_data = safe_jikan_request(f"{JIKAN_URL}/anime/{anime_id}/full")
        if not info_data:
            raise ValueError("Не вдалося отримати дані з Jikan API")
        
        item = info_data.get('data') or {}

        # 2. Запит епізодів (завжди робимо паузу, щоб не дратувати API)
        time.sleep(0.5) 
        eps_data = safe_jikan_request(f"{JIKAN_URL}/anime/{anime_id}/episodes")
        episodes_list = eps_data.get('data') or [] if eps_data else []

        episodes = []
        for ep in episodes_list:
            episodes.append({
                'id': str(ep.get('mal_id', '')),
                'number': ep.get('mal_id', 0),
                'title': ep.get('title', 'Без назви')
            })

        if not episodes:
            episodes = [{'id': '1', 'number': 1, 'title': 'Епізод 1 (Дані уточнюються)'}]

        images = item.get('images') or {}
        jpg = images.get('jpg') or {}
        image_url = jpg.get('large_image_url') or ''

        anime_data = {
            'id': str(item.get('mal_id', anime_id)),
            'title': item.get('title_english') or item.get('title') or 'Unknown',
            'description': item.get('synopsis') or 'Опис тимчасово відсутній',
            'image': image_url,
            'status': item.get('status') or 'Unknown',
            'episodes': episodes,
            
            'trailer_url': item.get('trailer', {}).get('url') or None,
            'rating': item.get('score') or 0,
            'releaseDate': item.get('year') or (item.get('aired', {}).get('prop', {}).get('from', {}).get('year')),
            'type': item.get('type') or 'TV',
            'duration': item.get('duration') or 'Невідомо',
            'age_rating': item.get('rating') or 'Немає',
            'source': item.get('source') or 'Оригінал',
            'studio': [s.get('name') for s in item.get('studios', [])] if item.get('studios') else ['Невідома'],
            'genres': [g.get('name') for g in item.get('genres', [])],
        }

        if cached_anime:
            cached_anime.data = anime_data
            cached_anime.save()
        else:
            AnimeCache.objects.create(anime_id=anime_id, data=anime_data)

        return JsonResponse(anime_data, safe=False)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        if cached_anime:
            return JsonResponse(cached_anime.data, safe=False)
        return JsonResponse({'error': 'Не вдалося завантажити аніме', 'details': str(e)}, status=404)


@require_http_methods(["GET"])
def get_streaming_links(request, episode_id):
    """
    Поки парсери не оновляться, ми віддаємо надійне тестове відео (HLS потік Big Buck Bunny).
    Це дозволить тобі протестувати відеоплеєр та його логіку на фронтенді.
    """
    return JsonResponse({
        'sources': [
            {
                'url': 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                'quality': 'auto'
            }
        ]
    }, safe=False)


@require_http_methods(["GET"])
def search_anime(request):
    """ПОШУК: Шукає аніме за назвою та застосовує фільтри (Без 18+)"""
    try:
        query = request.GET.get('q', '')
        page = request.GET.get('page', 1)
        
        anime_type = request.GET.get('type', '')
        status = request.GET.get('status', '')
        age_rating = request.GET.get('rating', '')
        order_by = request.GET.get('order_by', 'score') # За замовчуванням сортуємо за рейтингом
        sort = request.GET.get('sort', 'desc')          # За спаданням (від найвищого до найнижчого)
        
        if not query:
            return JsonResponse({'results': [], 'hasNextPage': False, 'currentPage': 1, 'totalPages': 1}, safe=False)

        # Будуємо базовий URL
        url = f"{JIKAN_URL}/anime?q={query}&page={page}&sfw=true"
        
        # Додаємо фільтри, якщо вони вибрані, перенесені на нові рядки згідно з PEP-8
        if anime_type: 
            url += f"&type={anime_type}"
        if status: 
            url += f"&status={status}"
        if age_rating: 
            url += f"&rating={age_rating}"
        if order_by: 
            url += f"&order_by={order_by}"
        if sort: 
            url += f"&sort={sort}"

        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        json_response = response.json()
        data = json_response.get('data', [])
        
        pagination = json_response.get('pagination', {})
        has_next_page = pagination.get('has_next_page', False)
        current_page = pagination.get('current_page', int(page))
        total_pages = pagination.get('last_visible_page', 1)
        
        results = []
        for item in data:
            genres = [g.get('name') for g in item.get('genres', [])]
            age_rating = item.get('rating') or ''
            
            # Жорсткий фільтр 18+
            has_forbidden_genre = any(genre in FORBIDDEN_GENRES for genre in genres)
            is_explicit = 'Rx' in age_rating
            
            if has_forbidden_genre or is_explicit:
                continue
            
            results.append({
                'id': str(item.get('mal_id')),
                'title': item.get('title_english') or item.get('title'),
                'image': item.get('images', {}).get('jpg', {}).get('large_image_url'),
                'genres': genres,
                'rating': item.get('score') or 0,
                'description': item.get('synopsis') or '',
                'year': item.get('year') or (item.get('aired', {}).get('prop', {}).get('from', {}).get('year')),
                'episodes': item.get('episodes') or 0,
            })
            
        return JsonResponse({
            'results': results,
            'hasNextPage': has_next_page,
            'currentPage': current_page,
            'totalPages': total_pages
        }, safe=False)
        
    except requests.RequestException as e:
        return JsonResponse({'error': 'Search failed', 'details': str(e)}, status=502)