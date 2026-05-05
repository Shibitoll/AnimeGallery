from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    """
    Налаштування відображення нашого кастомного користувача в адмінці.
    Ми додаємо сюди наші нові поля, щоб ти міг їх редагувати прямо з браузера.
    """
    fieldsets = UserAdmin.fieldsets + (
        ('Додаткова інформація (Профіль)', {'fields': ('avatar', 'bio')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)