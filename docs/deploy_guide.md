# AnimeGallery Production Deployment Guide

Цей документ призначений для Release Engineers та DevOps-фахівців. Він описує процес підготовки, налаштування та запуску проєкту **AnimeGallery** у виробничому середовищі (Production).

---

## 1. Апаратне забезпечення (Hardware Requirements)
Вимоги до апаратного забезпечення

Для стабільної роботи серверної та клієнтської частин рекомендуються наступні мінімальні характеристики:

- **Архітектура:** x86_64 або ARM64  
- **CPU:** 2 ядра (мінімум 1 ядро для легких навантажень)  
- **RAM:** 2 GB (мінімум 1 GB, якщо використовується Swap, 2 GB необхідно для збірки Node.js)  
- **Диск:** 15 GB SSD (враховуючи ОС, залежності, медіафайли та файл бази даних)  

---

## 2. Необхідне програмне забезпечення (Software)
Необхідне програмне забезпечення.

На цільовому сервері мають бути встановлені:

- **OS:** Ubuntu 22.04 LTS / 24.04 LTS або аналогічний дистрибутив Linux  
- **Backend Runtime:** Python 3.10+ та `python3-venv`  
- **Frontend Runtime:** Node.js 18.x+ та npm  
- **Web Server:** Nginx (як Reverse Proxy)  
- **Process Manager:** Gunicorn (для Django) та systemd (для контролю процесів)  
- **Version Control:** Git  

---

## 3. Налаштування мережі та конфігурація серверів

### Налаштування мережі (Firewall та Nginx)
- Відкрити порти: `80 (HTTP)`, `443 (HTTPS)` та `22 (SSH)`  
- Публічна IP-адреса має бути прив'язана до домену

### Nginx Routing
Nginx має приймати запити та перенаправляти їх:

- Запити на `/api/` та `/admin/` → до Gunicorn (через сокет або порт 8000)  
- Запити на кореневий домен `/` → до зібраних статичних файлів React (`dist/`)  

### Змінні оточення (.env)
У **виробничому середовищі** файл `backend/anime_backend/.env` повинен містити:
* `DEBUG=False` (критично для безпеки).
* `ALLOWED_HOSTS=your-domain.com`.
* `SECRET_KEY` (згенерований заново, довгий випадковий рядок).

### Конфігурація системних сервісів (systemd)
Для того, щоб бекенд працював як фоновий процес і автоматично запускався після перезавантаження сервера, створіть файл `/etc/systemd/system/animegallery.service`:

```ini
[Unit]
Description=Gunicorn instance to serve AnimeGallery
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/AnimeGallery/backend/anime_backend
ExecStart=/var/www/AnimeGallery/backend/anime_backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:8000 \
    anime_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

---

## 4. Налаштування СУБД (Database)

Проєкт використовує SQLite, яка зберігає всі дані у файлі db.sqlite3. Для Production необхідно забезпечити правильні права доступу.

Користувач, від імені якого працює Gunicorn (наприклад, www-data), повинен мати права на запис як до самого файлу db.sqlite3, так і до папки, де він лежить (інакше БД буде Read-Only).

# Перехід у папку бекенду
```bash
cd /var/www/AnimeGallery/backend/anime_backend
```

# Зміна власника файлу та папки на www-data
```bash
sudo chown www-data:www-data db.sqlite3
sudo chown www-data:www-data .
```

# Надання прав на читання та запис
```bash
sudo chmod 664 db.sqlite3
sudo chmod 775 .
```

---

## 5. Розгортання коду (Deployment Steps)

# Клонування:
```bash
cd /var/www/
git clone https://github.com/Shibitoll/AnimeGallery.git
cd AnimeGallery
```
# Frontend Build
```bash
cd ..
npm install
npm run build
```
# Backend Setup
```bash
cd ../backend
python -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers django-filter drf-spectacular pdoc ruff gunicorn
python manage.py collectstatic --noinput
python manage.py migrate
```
# Запуск Gunicorn через systemd
```bash
sudo systemctl start animegallery
sudo systemctl enable animegallery
```

## 6. Перевірка працездатності (Health Check)

Система вважається успішно розгорнутою, якщо виконуються наступні умови:

1. **Frontend:** Головна сторінка каталогу аніме відкривається у браузері без помилок 404/502. Перехід між вкладками працює коректно.
2. **API Check:** Запит до http://your-domain.com/api/animes/ повертає коректний JSON зі списком тайтлів (статус 200 OK).
3. **Swagger:* Інтерактивна документація за адресою http://your-domain.com/api/docs/ доступна та успішно виконує тестові запити.
4. **Database Write Check:* Користувач може успішно змінювати рейтинг аніме або додавати нове (перевірка того, що SQLite не заблокована на запис).
5. **Logs:** Команда sudo journalctl -u animegallery -f не показує Traceback-помилок Python чи повідомлень про відмову в доступі.
