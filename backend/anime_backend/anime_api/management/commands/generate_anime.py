import random

from anime_api.models import Anime
from django.core.management.base import BaseCommand
from faker import Faker


class Command(BaseCommand):
    help = 'Генерує 1000 тестових записів аніме з базовим кастомним постером проєкту'

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        self.stdout.write("Видалення старих записів аніме...")
        Anime.objects.all().delete()

        PROJECT_DEFAULT_POSTER = "https://placehold.co/300x420/e5e7eb/4b5563?text=%D0%A2%D0%B2%D0%BE%D1%8F%20%D1%83%D1%8F%D0%B2%D0%B0%0A%D0%BC%D0%B0%D0%BB%D1%8E%D1%94%20%D0%BA%D1%80%D0%B0%D1%89%D0%B5%0A%D0%B7%D0%B0%20%D0%B1%D1%83%D0%B4%D1%8C-%D1%8F%D0%BA%D0%B8%D0%B9%0A%D0%BF%D0%BE%D1%81%D1%82%D0%B5%D1%80!&font=Montserrat"

        self.stdout.write("Генерація 1000 аніме (це займе кілька секунд)...")
        animes = []
        studios = ['MAPPA', 'Madhouse', 'Bones', 'Kyoto Animation', 'Ufotable']
        genres_list = ['Shounen', 'Isekai', 'Romance', 'Mecha', 'Seinen', 'Comedy']

        for i in range(1000):
            animes.append(Anime(
                title=f"{fake.catch_phrase()} (Аніме {i})",
                description="Власне аніме, додане до особистої колекції. Час відкривати нові світи!",
                poster=PROJECT_DEFAULT_POSTER,
                genres=f"{random.choice(genres_list)}, {random.choice(genres_list)}",
                year=str(random.randint(1990, 2026)),
                episodes=str(random.randint(12, 100)),
                studio=random.choice(studios),
                rating=round(random.uniform(5.0, 10.0), 1)
            ))

        # Bulk create для надшвидкого запису в БД (1 запит замість 1000)
        Anime.objects.bulk_create(animes)
        
        self.stdout.write(self.style.SUCCESS('Успішно створено 1000 тестових аніме з вашим фірмовим постером!'))