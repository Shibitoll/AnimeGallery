from django.contrib import admin
from .models import Anime

@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    list_display = ('title', 'rating', 'year', 'episodes', 'studio', 'is_favorite', 'in_watchlist')
    list_filter = ('is_favorite', 'in_watchlist', 'year', 'studio')
    search_fields = ('title', 'description', 'genres')
    list_editable = ('is_favorite', 'in_watchlist') # Дозволяє змінювати ці поля прямо зі списку