import logging
import time

import requests
from anime_api.models import Anime
from django.contrib.auth import get_user_model  # ДОДАНО: Імпорт моделі користувача
from django.core.management.base import BaseCommand

logger = logging.getLogger('anime_api')
User = get_user_model() # ДОДАНО: Отримуємо модель користувача

class Command(BaseCommand):
    help = 'Завантажує базу аніме з AniHub API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--pages', 
            type=int, 
            default=5, 
            help='Кількість сторінок для завантаження (макс. 20 записів на сторінку)'
        )

    def handle(self, *args, **kwargs):
        # ДОДАНО: Шукаємо першого користувача (адміна)
        admin_user = User.objects.first()
        if not admin_user:
            self.stdout.write(self.style.ERROR("Помилка: Спочатку створіть суперкористувача!"))
            return

        pages_to_fetch = kwargs['pages']
        
        self.stdout.write("Видалення старих імпортованих записів аніме...")
        Anime.objects.filter(is_added_by_user=False).delete()

        PROJECT_DEFAULT_POSTER = "https://placehold.co/300x420/e5e7eb/4b5563?text=Постер+Відсутній&font=Montserrat"

        self.stdout.write(f"Починаємо завантаження {pages_to_fetch} сторінок з AniHub API...")
        animes_to_create = []

        for page in range(1, pages_to_fetch + 1):
            url = f"https://api.anihub.in.ua/anime?page={page}&page_size=20"
            self.stdout.write(f"Запит сторінки {page}...")
            
            try:
                response = requests.get(url, timeout=10)
                
                if response.status_code != 200:
                    self.stdout.write(self.style.ERROR(f"Помилка API на сторінці {page}: код {response.status_code}"))
                    break
                    
                data = response.json()
                items = data.get('items', [])
                
                if not items:
                    self.stdout.write(self.style.WARNING("Більше немає даних для завантаження."))
                    break

                for item in items:
                    rating = item.get('rating')
                    if rating is None:
                        rating = 0.0

                    animes_to_create.append(Anime(
                        owner=admin_user, # <--- ДОДАНО: Прив'язуємо до адміна
                        anihub_id=item.get('id'),
                        mal_id=item.get('mal_id'),
                        anilist_id=item.get('anilist_id'),
                        imdb_id=item.get('imdb_id'),
                        slug=item.get('slug'),
                        title_ukrainian=item.get('title_ukrainian') or item.get('title_english') or 'Без назви',
                        description=item.get('description_uk') or item.get('description') or '',
                        genres=item.get('genres', []),
                        year=item.get('year'),
                        type=item.get('type'),
                        status=item.get('status'),
                        episodes_count=item.get('episodes_count'),
                        has_ukrainian_dub=item.get('has_ukrainian_dub', False),
                        poster=item.get('poster_url', PROJECT_DEFAULT_POSTER),
                        rating=round(float(rating), 1),
                        is_added_by_user=False
                    ))
                
                time.sleep(1.5)

            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f"Помилка з'єднання: {e}"))
                break

        self.stdout.write("Збереження в базу даних...")
        Anime.objects.bulk_create(animes_to_create, ignore_conflicts=True)
        
        self.stdout.write(self.style.SUCCESS(f'Успішно завантажено {len(animes_to_create)} аніме з AniHub!'))