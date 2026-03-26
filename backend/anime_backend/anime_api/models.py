"""
Модуль моделей бази даних для додатка anime_api.

Містить визначення структури таблиць для зберігання інформації про аніме 
та їхнього зв'язку із користувачами (користувацькі списки, оцінки тощо).
"""
from django.contrib.auth.models import User
from django.db import models


class Anime(models.Model):
    """
    Модель Anime представляє інформацію про аніме у базі даних.
    
    Включає:
    - основні метадані (назва, опис, постер)
    - характеристики (жанри, рік, студія, епізоди)
    - рейтинги (загальний та користувацький)
    - персональні статуси користувача
    """
    
    title = models.CharField(max_length=255, verbose_name="Назва")
    """str: Офіційна назва аніме."""
    description = models.TextField(verbose_name="Опис")
    """str: Детальний опис сюжету."""
    poster = models.URLField(max_length=500, verbose_name="URL постера")
    """str: Посилання на зображення обкладинки/постера."""
    
    # Характеристики (згідно з вашою моделлю даних у React)
    genres = models.CharField(max_length=255, verbose_name="Жанри")
    """str: Список жанрів, розділених комою."""
    year = models.CharField(max_length=4, verbose_name="Рік випуску")
    """str: Рік виходу аніме на екрани."""
    episodes = models.CharField(max_length=50, verbose_name="Кількість епізодів")
    """str: Загальна кількість серій."""
    studio = models.CharField(max_length=255, verbose_name="Студія")
    """str: Анімаційна студія, що створила тайтл."""
    status = models.CharField(max_length=100, blank=True, null=True, verbose_name="Статус")
    """str, optional: Статус виходу (наприклад, 'Виходить', 'Завершено')."""
    
    # Рейтинги (Загальний та Користувацький)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Загальний рейтинг"
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
    in_watchlist = models.BooleanField(default=False, verbose_name="Переглянуто")
    """bool: Прапорець, що вказує, чи додав користувач аніме до списку переглянутих."""
    
    # Зв'язок з користувачем (ER: User <-> Anime)
    # Поле owner пов'язує аніме з конкретним зареєстрованим користувачем
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='animes', 
        null=True, 
        blank=True,
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
