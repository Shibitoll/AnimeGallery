"""
Модуль серіалізаторів для додатка anime_api.

Серіалізатори відповідають за перетворення складних типів даних у нативні типи Python, які потім легко 
конвертуються у JSON для відправки на клієнт (React). 
Також вони виконують зворотний процеста валідацію вхідних даних.
"""
from rest_framework import serializers

from .models import Anime


class AnimeSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для моделі Anime.
    
    Забезпечує перетворення даних аніме для API. Важливою функцією цього 
    серіалізатора є адаптація назв полів: він перетворює Python-стиль (snake_case) 
    у JavaScript-стиль (camelCase), щоб фронтенд на React міг зручно з ними працювати.
    """
    userRating = serializers.DecimalField(
        source='user_rating', 
        max_digits=3, 
        decimal_places=1, 
        required=False, 
        default=0.0
    )
    """DecimalField: Мапить поле `user_rating` бази даних у `userRating` для JSON."""
    isFavorite = serializers.BooleanField(source='is_favorite', required=False, default=False)
    """BooleanField: Мапить поле `is_favorite` бази даних у `isFavorite` для JSON."""
    
    isWatching = serializers.BooleanField(source='is_watching', required=False, default=False)
    
    isWatched = serializers.BooleanField(source='in_watchlist', required=False, default=False)
    """BooleanField: Мапить поле `in_watchlist` бази даних у `isWatched` для JSON."""
    isAddedByUser = serializers.BooleanField(source='is_added_by_user', required=False, default=True)
    """BooleanField: Мапить поле `is_added_by_user` бази даних у `isAddedByUser` для JSON."""

    class Meta:
        """
        Метадані серіалізатора.
        
        Вказує, яка модель використовується та які саме поля будуть 
        включені у фінальний JSON-відповідь API.
        """
        model = Anime
        fields = [
            'id', 'mal_id', 'title', 'rating', 'userRating', 'poster', 
            'description', 'genres', 'year', 'episodes', 
            'studio', 'status', 'isFavorite', 'isWatching', 'isWatched', 'isAddedByUser',
            'planned'
        ]