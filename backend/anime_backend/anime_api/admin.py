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
    швидкого редагування записів каталогу аніме, адаптованого під AniHub API.
    """
    # Оновлено: виводимо українську назву, нове ID та нові типи
    list_display = (
        'title_ukrainian', 'anihub_id', 'rating', 'year', 
        'episodes_count', 'type', 'has_ukrainian_dub', 
        'is_favorite', 'is_watching', 'in_watchlist'
    )
    
    # Оновлено: додано фільтр за наявністю дубляжу, типом та всіма статусами
    list_filter = (
        'is_favorite', 'is_watching', 'in_watchlist', 'planned', 
        'has_ukrainian_dub', 'type', 'year'
    )
    
    # Оновлено: пошук за українською назвою та AniHub ID
    search_fields = ('title_ukrainian', 'anihub_id', 'slug', 'description')
    
    # Додано is_watching для швидкого редагування
    list_editable = ('is_favorite', 'is_watching', 'in_watchlist')

@admin.register(AnimeCache)
class AnimeCacheAdmin(admin.ModelAdmin):
    """
    Якщо ти вирішиш повністю видалити кеш (оскільки фронтенд тепер робить 
    запити до AniHub напряму), цей клас і саму модель можна буде стерти.
    """
    list_display = ('anime_id', 'updated_at')
    search_fields = ('anime_id',)
    readonly_fields = ('updated_at',)