from rest_framework import serializers

from .models import Anime


class AnimeSerializer(serializers.ModelSerializer):
    userRating = serializers.DecimalField(
        source='user_rating', 
        max_digits=3, 
        decimal_places=1, 
        required=False, 
        default=0.0
    )
    isFavorite = serializers.BooleanField(source='is_favorite', required=False, default=False)
    isWatched = serializers.BooleanField(source='in_watchlist', required=False, default=False)
    isAddedByUser = serializers.BooleanField(source='is_added_by_user', required=False, default=True)

    class Meta:
        model = Anime
        fields = [
            'id', 'title', 'rating', 'userRating', 'poster', 
            'description', 'genres', 'year', 'episodes', 
            'studio', 'status', 'isFavorite', 'isWatched', 'isAddedByUser'
        ]