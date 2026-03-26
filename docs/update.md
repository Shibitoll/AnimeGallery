# Update & Rollback Guide (Регламент оновлення та відкату)

Цей документ містить покрокові інструкції для **Release Engineer** та **DevOps** фахівців щодо проведення планових оновлень системи **AnimeGallery** та дій у разі виникнення критичних помилок.

---

## 1. Підготовка до оновлення (Preparation)

### Створення резервних копій (Backup)

Перед початком оновлення обов'язково створіть резервні копії поточного стану системи.

#### База даних (SQLite)

```bash
cp backend/anime_backend/db.sqlite3 backend/anime_backend/db.sqlite3.bak_$(date +%Y%m%d_%H%M)
```

#### Медіа-файли (постери аніме)

```bash
tar -czf media_backup_$(date +%Y%m%d).tar.gz backend/anime_backend/media/
```

#### Зібраний фронтенд

```bash
cp -r dist dist_bak_$(date +%Y%m%d_%H%M)
```

---

### Перевірка сумісності

Перед оновленням необхідно перевірити:

- файл `backend/anime_backend/requirements.txt` на наявність нових залежностей
- версії середовища:
  - **Python:** 3.10+
  - **Node.js:** 18+

---

### Планування часу простою (Downtime)

- Очікуваний час простою: **5–15 хвилин**
- Рекомендоване вікно оновлення: **02:00 – 05:00**

---

## 2. Процес оновлення (Update Process)

### Крок 1: Зупинка служб

```bash
sudo systemctl stop animegallery.service
```

---

### Крок 2: Розгортання нового коду

```bash
git fetch origin
git checkout main
git pull origin main
```

---

### Крок 3: Оновлення Backend та міграція бази даних

```bash
cd backend/anime_backend
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

cd ../..
```

---

### Крок 4: Оновлення Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

---

### Крок 5: Оновлення конфігурації та запуск сервісів

Перевірте файл `.env` та додайте нові змінні з `.env.example`, якщо вони з’явилися.

```bash
sudo systemctl start animegallery.service
sudo systemctl restart nginx
```

---

## 3. Перевірка після оновлення (Verification)

### Health Check API

```bash
curl -I http://127.0.0.1:8000/api/animes/
```

Очікуваний результат: `HTTP/1.1 200 OK`.

---

### Перевірка Frontend

- Головна сторінка каталогу аніме відкривається без помилок
- Навігація та пошук працюють коректно
- Нові функції після оновлення доступні

---

### Перевірка запису в базу даних

Спробуйте:
- змінити рейтинг аніме
- або додати новий тайтл

Це підтвердить, що SQLite має права на запис і міграції виконані.

---

### Моніторинг продуктивності

```bash
htop
sudo journalctl -u animegallery.service -f
```

---

### Можливі проблеми та їх вирішення

#### 502 Bad Gateway

```bash
sudo systemctl status animegallery.service
sudo journalctl -u animegallery.service -n 50
```

---

#### 500 Internal Server Error

```bash
sudo journalctl -u animegallery.service -f
```

---

#### Статичні файли не оновилися

```bash
sudo systemctl restart nginx
```

Також очистіть кеш браузера (`Ctrl + F5`).

---

## 4. Процедура відкату (Rollback Procedure)

У разі критичних помилок після оновлення необхідно виконати відкат.

---

### Крок 1: Відкат коду

```bash
git checkout HEAD@{1}
```

Або до конкретної версії:

```bash
git checkout v1.0.0
```

---

### Крок 2: Відновлення бази даних

```bash
mv backend/anime_backend/db.sqlite3 backend/anime_backend/db.sqlite3.failed
cp backend/anime_backend/db.sqlite3.bak_YYYYMMDD_HHMM backend/anime_backend/db.sqlite3
```

---

### Крок 3: Відновлення медіа-файлів

```bash
tar -xzf media_backup_YYYYMMDD.tar.gz
```

---

### Крок 4: Відновлення фронтенду

```bash
rm -rf dist
cp -r dist_bak_YYYYMMDD_HHMM dist
```

---

### Крок 5: Перезапуск служб

```bash
sudo systemctl restart animegallery.service
sudo systemctl restart nginx
```

---

### Перевірка після відкату

```bash
curl -I http://127.0.0.1:8000/api/animes/
```

Якщо відповідь `200 OK`, система успішно відновлена.