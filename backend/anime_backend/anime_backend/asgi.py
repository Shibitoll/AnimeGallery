"""
Конфігурація ASGI для проєкту anime_backend.

Цей модуль містить налаштування для асинхронного інтерфейсу шлюзу сервера (ASGI).
Він експортує ASGI-застосунок як змінну рівня модуля з назвою `application`, 
яка використовується сучасними асинхронними вебсерверами (наприклад, Uvicorn або Daphne) 
для обробки запитів (у тому числі для роботи з WebSockets, якщо такі будуть додані в майбутньому).

Детальніше: https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'anime_backend.settings')

application = get_asgi_application()
"""
callable: ASGI-застосунок.

Головна точка входу для асинхронних вебсерверів, через яку вони 
взаємодіють із вашим Django-проєктом.
"""