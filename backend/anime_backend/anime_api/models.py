from django.contrib.auth.models import User
from django.db import models


class Anime(models.Model):
    # Основна інформація
    title = models.CharField(max_length=255, verbose_name="Назва")
    description = models.TextField(verbose_name="Опис")
    poster = models.URLField(max_length=500, verbose_name="URL постера")
    
    # Характеристики (згідно з вашою моделлю даних у React)
    genres = models.CharField(max_length=255, verbose_name="Жанри")
    year = models.CharField(max_length=4, verbose_name="Рік випуску")
    episodes = models.CharField(max_length=50, verbose_name="Кількість епізодів")
    studio = models.CharField(max_length=255, verbose_name="Студія")
    status = models.CharField(max_length=100, blank=True, null=True, verbose_name="Статус")
    
    # Рейтинги (Загальний та Користувацький)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Загальний рейтинг"
    )
    user_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0.0, 
        verbose_name="Ваша оцінка"
    )
    
    # Статуси (ER-діаграма: стани аніме для конкретного юзера)
    is_favorite = models.BooleanField(default=False, verbose_name="В улюблених")
    in_watchlist = models.BooleanField(default=False, verbose_name="Переглянуто")
    
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
    is_added_by_user = models.BooleanField(
        default=False, 
        verbose_name="Додано користувачем самостійно"
    )

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Аніме"
        verbose_name_plural = "Аніме"
        # Сортування за загальним рейтингом за замовчуванням
        ordering = ['-rating']
