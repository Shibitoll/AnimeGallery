"""
Модуль налаштування адміністративної панелі Django.

Цей модуль містить конфігурацію відображення моделей бази даних 
у вбудованому інтерфейсі адміністратора (Django Admin).
"""
from django.contrib import admin

from .models import Anime, AnimeCache


@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    """
    Клас налаштування відображення моделі Anime в адмін-панелі.
    
    Забезпечує зручний інтерфейс для перегляду, фільтрації, пошуку та 
    швидкого редагування записів каталогу аніме.
    """
    list_display = ('title', 'rating', 'year', 'episodes', 'studio', 'is_favorite', 'in_watchlist')
    """tuple: Поля, які виводяться у загальній таблиці списку аніме."""
    list_filter = ('is_favorite', 'in_watchlist', 'year', 'studio')
    """tuple: Поля, за якими формується бічна панель фільтрації."""
    search_fields = ('title', 'description', 'genres')
    """tuple: Поля, за якими працює рядок текстового пошуку."""
    list_editable = ('is_favorite', 'in_watchlist')
    """tuple: Поля, які дозволено змінювати прямо з таблиці (без переходу в картку)."""    

@admin.register(AnimeCache)
class AnimeCacheAdmin(admin.ModelAdmin):
    list_display = ('anime_id', 'updated_at')
    search_fields = ('anime_id',)
    readonly_fields = ('updated_at',)