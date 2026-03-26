import os
import sys
from pathlib import Path

import django
import pdoc

sys.path.insert(0, os.path.abspath('./anime_backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'anime_backend.settings')

django.setup()

# Шлях, куди збережеться готова документація (в існуючу папку backend/docs/)
output_path = Path("./docs/backend_html")

pdoc.pdoc("./anime_backend", "./anime_api", "./user_api", output_directory=output_path)

print("Документацію бекенду успішно згенеровано у папку docs/backend_html")