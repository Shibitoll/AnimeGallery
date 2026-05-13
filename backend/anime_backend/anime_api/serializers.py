"""
Модуль серіалізаторів для додатка anime_api.
"""
from rest_framework import serializers

from .models import Anime


class AnimeSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для моделі Anime.
    Адаптує snake_case під camelCase для React.
    """
    anihubId = serializers.IntegerField(source='anihub_id')
    titleUkrainian = serializers.CharField(source='title_ukrainian')
    malId = serializers.IntegerField(source='mal_id', required=False, allow_null=True)
    anilistId = serializers.IntegerField(source='anilist_id', required=False, allow_null=True)
    imdbId = serializers.CharField(source='imdb_id', required=False, allow_null=True)
    
    episodesCount = serializers.IntegerField(source='episodes_count', required=False, allow_null=True)
    hasUkrainianDub = serializers.BooleanField(source='has_ukrainian_dub', required=False, default=False)
    dubbingStudios = serializers.JSONField(source='dubbing_studios', required=False)

    userRating = serializers.DecimalField(
        source='user_rating', 
        max_digits=3, 
        decimal_places=1, 
        required=False, 
        default=0.0
    )
    
    isFavorite = serializers.BooleanField(source='is_favorite', required=False, default=False)
    isWatching = serializers.BooleanField(source='is_watching', required=False, default=False)
    isWatched = serializers.BooleanField(source='in_watchlist', required=False, default=False)
    isAddedByUser = serializers.BooleanField(source='is_added_by_user', required=False, default=False)

    class Meta:
        model = Anime
        fields = [
            'id', 'anihubId', 'malId', 'anilistId', 'imdbId', 'slug', 
            'titleUkrainian', 'description', 'poster', 'genres', 
            'year', 'type', 'episodesCount', 'status', 'hasUkrainianDub', 
            'dubbingStudios', 'rating', 'userRating', 'isFavorite', 
            'isWatching', 'isWatched', 'planned', 'isAddedByUser'
        ]
        # ВАЖЛИВО: Видаляємо стандартні валідатори унікальності, 
        # щоб дозволити POST запити від різних користувачів для одного ID
        extra_kwargs = {
            'anihubId': {'validators': []},
        }