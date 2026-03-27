import logging

from django.apps import AppConfig

logger = logging.getLogger('anime_api')

class AnimeApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'anime_api'

    def ready(self):
        logger.info("Сервіс Anime API успішно запущено.")