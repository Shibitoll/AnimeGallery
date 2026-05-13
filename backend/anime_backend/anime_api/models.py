import logging
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

logger = logging.getLogger('anime_api')

class Anime(models.Model):
    """
    Модель Anime представляє інформацію про аніме у базі даних,
    прив'язану до конкретного користувача.
    """
    
    # ПРИБРАНО unique=True для підтримки багатьох користувачів
    anihub_id = models.IntegerField(verbose_name="ID з AniHub")
    
    slug = models.CharField(max_length=255, blank=True, null=True, verbose_name="Slug")
    title_ukrainian = models.CharField(max_length=255, verbose_name="Українська назва", db_index=True)
    
    mal_id = models.IntegerField(blank=True, null=True, verbose_name="ID з MyAnimeList")
    anilist_id = models.IntegerField(blank=True, null=True, verbose_name="ID з AniList")
    imdb_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID з IMDb")

    description = models.TextField(verbose_name="Опис", blank=True, null=True)
    poster = models.URLField(max_length=500, verbose_name="URL постера", blank=True, null=True)
    
    genres = models.JSONField(verbose_name="Жанри", default=list)
    year = models.IntegerField(blank=True, null=True, verbose_name="Рік випуску")
    episodes_count = models.IntegerField(blank=True, null=True, verbose_name="Кількість епізодів")

    type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Тип")
    status = models.CharField(max_length=100, blank=True, null=True, verbose_name="Статус")

    has_ukrainian_dub = models.BooleanField(default=False, verbose_name="Є український дубляж")
    dubbing_studios = models.JSONField(verbose_name="Студії озвучення", default=list)

    rating = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        default=0.00, 
        verbose_name="Загальний рейтинг",
        db_index=True
    )
    
    user_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Ваша оцінка"
    )
    
    # Статуси користувача
    is_favorite = models.BooleanField(default=False, verbose_name="В улюблених")
    is_watching = models.BooleanField(default=False, verbose_name="Дивлюся зараз")
    in_watchlist = models.BooleanField(default=False, verbose_name="Переглянуто")
    planned = models.BooleanField(default=False, verbose_name="Планую подивитись")
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='animes',
        verbose_name="Власник"
    )
    
    is_added_by_user = models.BooleanField(
        default=False, 
        verbose_name="Додано користувачем самостійно"
    )

    def __str__(self):
        return f"{self.title_ukrainian} ({self.owner.username})"

    class Meta:
        verbose_name = "Аніме"
        verbose_name_plural = "Аніме"
        ordering = ['-rating']
        # ГАРАНТІЯ УНІКАЛЬНОСТІ: Один юзер - один запис конкретного аніме
        unique_together = ('owner', 'anihub_id')

    def save(self, *args, **kwargs):
        if self.user_rating < 0.0 or self.user_rating > 10.0:
            self.user_rating = 0.0
            
        try:
            super().save(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error saving anime: {str(e)}")
            raise e
        
class AnimeCache(models.Model):
    anime_id = models.CharField(max_length=255, unique=True, primary_key=True)
    data = models.JSONField(verbose_name="Дані з API")
    updated_at = models.DateTimeField(auto_now=True)

    def is_stale(self):
        return timezone.now() - self.updated_at > timedelta(hours=24)

    class Meta:
        verbose_name = "Кеш аніме"
        verbose_name_plural = "Кеш аніме"