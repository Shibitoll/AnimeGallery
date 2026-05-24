from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Кастомна модель користувача.
    Дозволяє легко розширювати профіль додатковими полями в майбутньому.
    """
    email = models.EmailField(
        unique=True, 
        verbose_name="Email адреса", 
        error_messages={
            'unique': "Користувач з такою поштою вже існує."
        }
    )
    
    avatar = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL Аватарки")
    bio = models.TextField(max_length=500, blank=True, verbose_name="Про себе")
    
    
    def __str__(self):
        return self.username