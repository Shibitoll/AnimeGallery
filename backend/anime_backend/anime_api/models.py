"""
Модуль моделей бази даних для додатка anime_api.

Містить визначення структури таблиць для зберігання інформації про аніме 
та їхнього зв'язку із користувачами (користувацькі списки, оцінки тощо).
"""
import logging
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

logger = logging.getLogger('anime_api')

class Anime(models.Model):
    """
    Модель Anime представляє інформацію про аніме у базі даних.
    
    Включає:
    - основні метадані (назва, опис, постер)
    - характеристики (жанри, рік, студія, епізоди)
    - рейтинги (загальний та користувацький)
    - персональні статуси користувача
    """
    
    # db_index=True для швидкого пошуку за назвою
    title = models.CharField(max_length=255, verbose_name="Назва", db_index=True)
    """str: Офіційна назва аніме."""
    
    mal_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID з Jikan API")
    """str: Оригінальний ідентифікатор аніме з MyAnimeList."""
    
    description = models.TextField(verbose_name="Опис")
    """str: Детальний опис сюжету."""
    
    poster = models.URLField(max_length=500, verbose_name="URL постера")
    """str: Посилання на зображення обкладинки/постера."""
    
    # db_index=True для швидкого пошуку за жанрами
    genres = models.CharField(max_length=255, verbose_name="Жанри", db_index=True)
    """str: Список жанрів, розділених комою."""
    
    year = models.CharField(max_length=4, verbose_name="Рік випуску")
    """str: Рік виходу аніме на екрани."""
    
    episodes = models.CharField(max_length=50, verbose_name="Кількість епізодів")
    """str: Загальна кількість серій."""
    
    studio = models.CharField(max_length=255, verbose_name="Студія")
    """str: Анімаційна студія, що створила тайтл."""
    
    status = models.CharField(max_length=100, blank=True, null=True, verbose_name="Статус")
    """str, optional: Статус виходу (наприклад, 'Виходить', 'Завершено')."""

    # db_index=True для швидкого сортування (ORDER BY rating DESC)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Загальний рейтинг",
        db_index=True
    )
    """float: Середня оцінка аніме на ресурсі (від 0.0 до 10.0)."""
    
    user_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Ваша оцінка"
    )
    """float: Персональна оцінка, яку виставив авторизований користувач."""
    
    # Статуси (ER-діаграма: стани аніме для конкретного юзера)
    is_favorite = models.BooleanField(default=False, verbose_name="В улюблених")
    """bool: Прапорець, що вказує, чи додав користувач аніме до списку улюблених."""
    
    is_watching = models.BooleanField(default=False, verbose_name="Дивлюся зараз")

    in_watchlist = models.BooleanField(default=False, verbose_name="Переглянуто")
    """bool: Прапорець, що вказує, чи додав користувач аніме до списку переглянутих."""

    planned = models.BooleanField(default=False, verbose_name="Планую подивитись")
    """bool: Вказує, чи планує користувач подивитися це аніме у майбутньому."""
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='animes',
        verbose_name="Власник"
    )
    """User, optional: Зовнішній ключ, що пов'язує запис із конкретним користувачем (ER-зв'язок)."""
    
    is_added_by_user = models.BooleanField(
        default=False, 
        verbose_name="Додано користувачем самостійно"
    )
    """bool: Вказує, чи було це аніме створене користувачем вручну, а не завантажене системою."""

    def __str__(self):
        """
        Повертає рядкове представлення об'єкта моделі.
        
        Returns:
            str: Назва аніме.
        """
        return self.title

    class Meta:
        """
        Метадані моделі Anime.
        
        Визначає імена таблиці в адмін-панелі та стандартне правило сортування (за найвищим рейтингом).
        """
        verbose_name = "Аніме"
        verbose_name_plural = "Аніме"
        ordering = ['-rating']

    def save(self, *args, **kwargs):
        """
        Зберігає об'єкт моделі Anime в базу даних із вбудованим логуванням.
        """

        if self.in_watchlist and not getattr(self, 'owner_id', None):
            logger.warning(
                f"Логічна аномалія: Аніме '{self.title}' позначено як 'Переглянуто', "
                f"але не має прив'язки до користувача."
            )
            
        if self.user_rating < 0.0 or self.user_rating > 10.0:
            logger.warning(
                f"Логічна аномалія: Оцінка для '{self.title}' виходить за межі "
                f"(поточна: {self.user_rating})."
            )

        try:
            super().save(*args, **kwargs)
            logger.info(f"Запис успішно збережено в БД: Аніме '{self.title}' (ID: {self.id})")
        except Exception as e:
            logger.critical(
                f"Критична помилка при збереженні аніме '{self.title}' в БД: {str(e)}", 
                exc_info=True
            )
            raise e
        
class AnimeCache(models.Model):
    """
    Модель для тимчасового зберігання (кешування) результатів пошуку з API.
    Це дозволяє не робити повторні запити до зовнішнього сервера Consumet.
    """
    # Текстовий ID (slug) аніме, наприклад "spy-x-family"
    anime_id = models.CharField(max_length=255, unique=True, primary_key=True)
    
    # Поле для зберігання всього JSON-об'єкта від API
    data = models.JSONField(verbose_name="Дані з API")
    
    # Автоматичне встановлення дати при створенні/оновленні
    updated_at = models.DateTimeField(auto_now=True)

    def is_stale(self):
        """Перевіряє, чи дані застаріли (старші за 24 години)."""
        return timezone.now() - self.updated_at > timedelta(hours=24)

    def __str__(self):
        return f"Кеш для {self.anime_id} (оновлено: {self.updated_at})"

    class Meta:
        verbose_name = "Кеш аніме"
        verbose_name_plural = "Кеш аніме"