"""
Модуль налаштування адміністративної панелі Django.

Цей модуль містить конфігурацію відображення моделей бази даних 
у вбудованому інтерфейсі адміністратора (Django Admin).
"""
from django.contrib import admin

from .models import Anime, AnimeCache, Comment, GlobalAnimeStats, UserAnimeInteraction


@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    """
    Клас налаштування відображення моделі Anime в адмін-панелі.
    
    Відображає ГЛОБАЛЬНІ дані про тайтл (без персональних списків юзерів).
    """
    list_display = (
        'title_ukrainian', 'anihub_id', 'rating', 'year', 
        'episodes_count', 'type', 'has_ukrainian_dub'
    )
    
    list_filter = ('has_ukrainian_dub', 'type', 'year', 'status')
    search_fields = ('title_ukrainian', 'anihub_id', 'slug', 'description')
    ordering = ('-rating',)


@admin.register(UserAnimeInteraction)
class UserAnimeInteractionAdmin(admin.ModelAdmin):
    """
    Клас налаштування відображення персональних списків користувачів.
    Тут знаходяться всі статуси: 'Улюблене', 'Дивлюсь' тощо.
    """
    list_display = (
        'user', 'anime', 'user_rating', 'is_favorite', 
        'is_watching', 'in_watchlist', 'planned', 'updated_at'
    )
    
    list_filter = (
        'is_favorite', 'is_watching', 'in_watchlist', 'planned', 'user_rating'
    )
    
    search_fields = ('user__username', 'anime__title_ukrainian')
    
    list_editable = ('is_favorite', 'is_watching', 'in_watchlist', 'planned')
    readonly_fields = ('updated_at',)


@admin.register(GlobalAnimeStats)
class GlobalAnimeStatsAdmin(admin.ModelAdmin):
    """
    Клас налаштування для перегляду внутрішньої статистики сайту 
    та зваженого рейтингу (Bayesian Rating).
    """
    list_display = ('anime', 'internal_avg_rating', 'votes_count', 'bayesian_rating')
    search_fields = ('anime__title_ukrainian', 'anime__anihub_id')
    ordering = ('-bayesian_rating',)
    # Забороняємо ручне редагування цих полів, бо вони вираховуються автоматично
    readonly_fields = ('internal_avg_rating', 'votes_count', 'bayesian_rating')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Клас налаштування відображення коментарів користувачів до тайтлів.
    """
    list_display = ('user', 'anime', 'created_at', 'text')
    search_fields = ('user__username', 'anime__title_ukrainian', 'text')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)


@admin.register(AnimeCache)
class AnimeCacheAdmin(admin.ModelAdmin):
    """
    Таблиця для проксі-кешу.
    Якщо ти вирішиш повністю видалити кеш (оскільки фронтенд тепер робить 
    запити до AniHub напряму), цей клас і саму модель можна буде стерти.
    """
    list_display = ('anime_id', 'updated_at')
    search_fields = ('anime_id',)
    readonly_fields = ('updated_at',)