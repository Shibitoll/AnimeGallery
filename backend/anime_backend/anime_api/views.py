"""
Модуль представлень (views) для додатка anime_api.
"""
import logging

import requests
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Anime
from .recommendation_service import get_bayesian_average_ranking, get_collaborative_recommendations
from .serializers import AnimeSerializer

logger = logging.getLogger('anime_api')

# === РОЗШИРЕНИЙ ФІЛЬТР БЕЗПЕКИ (NSFW / 18+) ===
RESTRICTED_GENRES = {
    'hentai', 'erotica', 'ecchi', '18+',
    'хентай', 'еротика', 'етті', 'еччі', 'nsfw'
}

def is_safe_anime(anime_data):
    """
    Бронебійна перевірка на недоречні жанри.
    Підтримує масиви об'єктів, масиви рядків та звичайні рядки.
    """
    genres = anime_data.get('genres', [])
    
    if isinstance(genres, str):
        genres = [g.strip() for g in genres.split(',')]
        
    if not genres:
        return True
        
    for genre in genres:
        # Витягуємо назву незалежно від формату даних
        g_name = genre.get('name', '') if isinstance(genre, dict) else str(genre)
        g_name_lower = g_name.lower().strip()
        
        # Точний збіг
        if g_name_lower in RESTRICTED_GENRES:
            return False
            
        # Перевірка на підрядок (наприклад, якщо прийде "Еротика (18+)")
        for restricted in RESTRICTED_GENRES:
            if restricted in g_name_lower:
                return False
                
    return True


class AnimeViewSet(viewsets.ModelViewSet):
    """
    ViewSet для керування даними моделі Anime у локальній базі користувача.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AnimeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = ['is_favorite', 'is_watching', 'in_watchlist', 'planned', 'year', 'type', 'has_ukrainian_dub']
    search_fields = ['title_ukrainian', 'description', 'genres']
    ordering_fields = ['rating', 'user_rating', 'year', 'title_ukrainian']

    def get_queryset(self):
        return Anime.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            # Створюємо копію даних, яку можна змінювати
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # --- ЛОГІКА МАПУВАННЯ ПОЛІВ (Адаптація під Serializer) ---
            # 1. Обробка Назви
            title = data.get('titleUkrainian') or data.get('title_ukrainian') or data.get('title')
            data['titleUkrainian'] = title
            data['title_ukrainian'] = title

            # 2. Обробка ID (anihubId — головне поле в серіалізаторі)
            aid = data.get('anihubId') or data.get('anihub_id') or data.get('mal_id') or data.get('id')
            if aid:
                data['anihubId'] = str(aid)
                data['anihub_id'] = str(aid)
            
            # 3. Обробка Епізодів
            eps = data.get('episodesCount') or data.get('episodes_count') or data.get('episodes') or 0
            data['episodesCount'] = eps
            data['episodes_count'] = eps

            # 4. Обробка Жанрів (Serializer чекає рядок)
            genres = data.get('genres', '')
            if isinstance(genres, list):
                data['genres'] = ', '.join([str(g) for g in genres])

            # Викликаємо стандартну валідацію вже з підготовленими даними
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Успішно збережено аніме: {title}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except ValidationError as e:
            logger.warning(f"Помилка валідації: {e.detail}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Це перехопить ту саму 500 помилку і виведе причину в термінал
            logger.error(f"ФАТАЛЬНА ПОМИЛКА БЕКЕНДУ: {str(e)}")
            return Response({"error": "Internal Server Error", "details": str(e)},
                             status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- ПРОКСІ-ФУНКЦІЯ ДЛЯ ОБХОДУ CORS ТА ФІЛЬТРАЦІЇ NSFW ---

@api_view(['GET'])
@permission_classes([AllowAny])
def anihub_proxy(request):
    path = request.GET.get('path', '')
    url = f"https://api.anihub.in.ua/{path}"
    
    params = request.GET.copy()
    if 'path' in params:
        del params['path']

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        # Фільтруємо відповідь від AniHub
        if isinstance(data, dict):
            if 'items' in data:
                data['items'] = [anime for anime in data['items'] if is_safe_anime(anime)]
            elif 'results' in data:
                data['results'] = [anime for anime in data['results'] if is_safe_anime(anime)]
        elif isinstance(data, list):
            data = [anime for anime in data if is_safe_anime(anime)]
            
        return JsonResponse(data, safe=False, status=response.status_code)
    except Exception as e:
        logger.error(f"Помилка проксі-запиту: {str(e)}")
        return JsonResponse({"error": "Failed to fetch data from AniHub"}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_anime(request):
    """
    Генерує персональні рекомендації, виключаючи аніме, 
    які користувач вже оцінив або додав до списків.
    """
    try:
        user = request.user
        
        # 1. Отримуємо ID всіх аніме, з якими користувач ВЖЕ взаємодіяв
        # (лайкнув, оцінив, дивиться або запланував)
        interacted_anime_ids = Anime.objects.filter(owner=user).values_list('anihub_id', flat=True)
        interacted_anime_ids = set(str(aid) for aid in interacted_anime_ids)

        # 2. Отримуємо всі оцінки для алгоритму
        ratings = Anime.objects.exclude(user_rating=0).values('owner_id', 'anihub_id', 'user_rating')
        formatted_ratings = [
            {'user_id': r['owner_id'], 'anihub_id': r['anihub_id'], 'rating': r['user_rating']}
            for r in ratings
        ]

        # 3. Викликаємо основний алгоритм
        rec_ids = get_collaborative_recommendations(user.id, formatted_ratings)

        # 4. Якщо колаборація не спрацювала — беремо загальний топ (Байєс)
        if not rec_ids:
            all_anime_for_top = Anime.objects.exclude(user_rating=0)
            rec_ids = get_bayesian_average_ranking(all_anime_for_top)
            
        if not rec_ids:
            return Response([])

        # 5. ФІЛЬТРАЦІЯ: Залишаємо тільки ті ID, яких НЕМАЄ в особистому списку юзера
        filtered_rec_ids = [rid for rid in rec_ids if str(rid) not in interacted_anime_ids]

        # 6. Отримуємо об'єкти аніме з бази для відфільтрованих ID
        anime_objects = Anime.objects.filter(anihub_id__in=filtered_rec_ids)
        anime_dict = {str(obj.anihub_id): obj for obj in anime_objects}

        final_data = []
        seen = set()
        
        # Формуємо фінальний масив (зберігаючи порядок релевантності від алгоритму)
        for rec_id in filtered_rec_ids:
            rec_id_str = str(rec_id)
            if rec_id_str in anime_dict and rec_id_str not in seen:
                obj = anime_dict[rec_id_str]
                
                # Перевірка на NSFW (твій попередній фільтр)
                if not is_safe_anime({'genres': obj.genres}):
                    continue
                    
                seen.add(rec_id_str)
                
                final_data.append({
                    'id': obj.anihub_id, 
                    'anihubId': str(obj.anihub_id),
                    'mal_id': str(obj.mal_id or obj.anihub_id), 
                    'titleUkrainian': obj.title_ukrainian,
                    'title': obj.title_ukrainian, # для сумісності
                    'poster': obj.poster,
                    'image': obj.poster, # для сумісності
                    'rating': str(obj.rating),
                    'description': obj.description or 'Опис відсутній',
                    'year': str(obj.year),
                    'episodesCount': obj.episodes_count,
                    'episodes': str(obj.episodes_count), # для сумісності
                    'genres': obj.genres if obj.genres else [],
                    'studio': getattr(obj, 'dubbing_studios', []),
                    
                    # Оскільки ми відфільтрували переглянуте, ці поля завжди false/0
                    'isFavorite': False,
                    'isWatching': False,
                    'isWatched': False,
                    'planned': False,
                    'userRating': 0.0,
                    'isAddedByUser': False
                })

        # Обмежуємо кількість рекомендацій (наприклад, топ-15 нових для юзера тайтлів)
        return Response(final_data[:15])

    except Exception as e:
        logger.error(f"Критична помилка рекомендацій: {e}")
        return Response([], status=200)