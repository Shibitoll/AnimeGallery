import logging
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

logger = logging.getLogger('anime_api')


class Anime(models.Model):
    """
    Глобальна таблиця. Містить лише загальну інформацію про аніме.
    Жодної прив'язки до користувачів тут немає.
    """
    anihub_id = models.IntegerField(unique=True, verbose_name="ID з AniHub", db_index=True)
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

    # Рейтинг, який приходить з апі аніхаб (Глобальний рейтинг, не персональний)
    rating = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        default=0.00, 
        verbose_name="Загальний рейтинг AniHub"
    )

    def __str__(self):
        return self.title_ukrainian

    class Meta:
        verbose_name = "Глобальне Аніме"
        verbose_name_plural = "Глобальна бібліотека аніме"
        ordering = ['-rating']


class UserAnimeInteraction(models.Model):
    """
    Таблиця зв'язку між користувачем і аніме (Персональні списки).
    Тут зберігається оцінка, статус перегляду тощо.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='anime_interactions',
        verbose_name="Користувач"
    )
    anime = models.ForeignKey(
        Anime,
        on_delete=models.CASCADE,
        related_name='user_interactions',
        verbose_name="Аніме"
    )
    
    user_rating = models.IntegerField(default=0, verbose_name="Оцінка користувача (1-10)")
    
    is_favorite = models.BooleanField(default=False, verbose_name="В улюблених")
    is_watching = models.BooleanField(default=False, verbose_name="Дивлюся зараз")
    in_watchlist = models.BooleanField(default=False, verbose_name="Переглянуто")
    planned = models.BooleanField(default=False, verbose_name="Планую подивитись")
    
    is_added_by_user = models.BooleanField(default=False, verbose_name="Додано користувачем самостійно")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Список користувача"
        verbose_name_plural = "Списки користувачів"
        unique_together = ('user', 'anime')  # Юзер не може додати одне аніме двічі

    def __str__(self):
        return f"{self.user.username} - {self.anime.title_ukrainian}"

    def save(self, *args, **kwargs):
        if self.user_rating < 0 or self.user_rating > 10:
            self.user_rating = 0
        super().save(*args, **kwargs)


class GlobalAnimeStats(models.Model):
    """
    Таблиця глобальної статистики AnimeGallery (Зважений рейтинг).
    """
    anime = models.OneToOneField(
        Anime,
        on_delete=models.CASCADE,
        related_name='stats',
        primary_key=True
    )
    internal_avg_rating = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        default=0.00, 
        verbose_name="Середня оцінка сайту"
    )
    votes_count = models.IntegerField(default=0, verbose_name="Кількість голосів")
    bayesian_rating = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        default=0.00, 
        verbose_name="Зважений рейтинг (Байєс)", 
        db_index=True
    )

    class Meta:
        verbose_name = "Статистика Аніме"
        verbose_name_plural = "Статистика Аніме"

    def update_metrics(self):
        """Метод для перерахунку статистики"""
        interactions = UserAnimeInteraction.objects.filter(anime=self.anime, user_rating__gt=0)
        self.votes_count = interactions.count()
        
        if self.votes_count > 0:
            self.internal_avg_rating = interactions.aggregate(Avg('user_rating'))['user_rating__avg']
        else:
            self.internal_avg_rating = 0.00

        m = 5 
        
        # Середня оцінка ВСІХ аніме на сайті
        all_stats = GlobalAnimeStats.objects.exclude(anime=self.anime).filter(votes_count__gt=0)
        if all_stats.exists():
            C = all_stats.aggregate(Avg('internal_avg_rating'))['internal_avg_rating__avg'] or 5.00
        else:
            C = 5.00

        v = self.votes_count
        R = float(self.internal_avg_rating)
        C = float(C)

        if v + m > 0:
            self.bayesian_rating = (v / (v + m)) * R + (m / (v + m)) * C
        else:
            self.bayesian_rating = 0.00

        self.save()


class Comment(models.Model):
    """Таблиця для зберігання коментарів."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(verbose_name="Текст коментаря")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Коментар"
        verbose_name_plural = "Коментарі"
        ordering = ['-created_at']


class AnimeCache(models.Model):
    anime_id = models.CharField(max_length=255, unique=True, primary_key=True)
    data = models.JSONField(verbose_name="Дані з API")
    updated_at = models.DateTimeField(auto_now=True)

    def is_stale(self):
        return timezone.now() - self.updated_at > timedelta(hours=24)

    class Meta:
        verbose_name = "Кеш аніме"
        verbose_name_plural = "Кеш аніме"


@receiver(post_save, sender=UserAnimeInteraction)
def update_rating_on_save(sender, instance, **kwargs):
    stats, _ = GlobalAnimeStats.objects.get_or_create(anime=instance.anime)
    stats.update_metrics()


@receiver(post_delete, sender=UserAnimeInteraction)
def update_rating_on_delete(sender, instance, **kwargs):
    try:
        stats = GlobalAnimeStats.objects.get(anime=instance.anime)
        stats.update_metrics()
    except GlobalAnimeStats.DoesNotExist:
        pass