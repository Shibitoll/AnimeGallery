# Стратегія резервного копіювання та відновлення (Backup & Recovery Guide)

Цей документ визначає регламент створення резервних копій (Backups) та процедури відновлення (Disaster Recovery) для виробничого середовища проєкту **AnimeGallery**. Документ призначений для DevOps-інженерів та системних адміністраторів.

---

## 1. Стратегія резервного копіювання

### 1.1 Типи резервних копій

Для забезпечення балансу між надійністю та економією дискового простору використовуються наступні типи:

- **Повні (Full Backups):** копіювання всієї бази даних (`db.sqlite3`), медіафайлів (`media/`), логів та конфігурацій. Виконується раз на тиждень.
- **Інкрементальні (Incremental Backups):** копіювання лише тих медіафайлів та логів, які змінилися з моменту останнього бекапу (через `rsync`). База даних SQLite копіюється повністю.
- **Диференціальні (Differential Backups):** копіювання всіх змін від останнього **повного** бекапу. Використовується перед великими оновленнями.

---

### 1.2 Частота створення

- **База даних:** щогодини локально, раз на добу — на зовнішнє сховище
- **Медіафайли:** щодня о 03:00
- **Конфігурації:** при кожній зміні + щотижневий архів

---

### 1.3 Зберігання та ротація копій (Retention Policy)

Використовується правило **3-2-1**:

- 3 копії даних
- 2 різні носії
- 1 копія поза сервером

Політика зберігання:

- **Локальні бекапи:** 7 днів
- **Хмарні бекапи:** 30 днів (daily) та 6 місяців (monthly)

---

## 2. Процедура резервного копіювання

### 2.1 База даних (SQLite)

Безпечне копіювання SQLite виконується через `.backup`:

```bash
sqlite3 /var/www/AnimeGallery/backend/anime_backend/db.sqlite3 \
".backup '/var/backups/animegallery/db/db_$(date +%Y%m%d_%H%M).sqlite3'"
```

---

### 2.2 Користувацькі дані (Media)

```bash
tar -czf /var/backups/animegallery/media/media_$(date +%Y%m%d).tar.gz \
-C /var/www/AnimeGallery/backend/anime_backend media/
```

---

### 2.3 Файли конфігурацій

```bash
tar -czf /var/backups/animegallery/configs/configs_$(date +%Y%m%d).tar.gz \
/var/www/AnimeGallery/backend/anime_backend/.env \
/etc/nginx/sites-available/animegallery \
/etc/systemd/system/animegallery.service
```

---

### 2.4 Логи системи

```bash
tar -czf /var/backups/animegallery/logs/logs_$(date +%Y%m%d).tar.gz /var/log/nginx/

journalctl -u animegallery.service --since "1 day ago" \
> /var/backups/animegallery/logs/app_logs_$(date +%Y%m%d).txt
```

---

## 3. Перевірка цілісності резервних копій

### Перевірка SQLite

```bash
sqlite3 /var/backups/animegallery/db/db_20260326.sqlite3 \
"PRAGMA integrity_check;"
```

Очікуваний результат:

```
ok
```

---

### Перевірка архівів

```bash
tar -tf /var/backups/animegallery/media/media_20260326.tar.gz > /dev/null
```

Якщо команда виконалась без помилок — архів не пошкоджений.

---

## 4. Автоматизація процесу (Скрипти та Cron)

### Скрипт резервного копіювання

Файл: `/usr/local/bin/backup_animegallery.sh`

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/animegallery"
TIMESTAMP=$(date +"%Y%m%d")

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/media"

# Резервна копія БД
sqlite3 /var/www/AnimeGallery/backend/anime_backend/db.sqlite3 \
".backup '$BACKUP_DIR/db/db_$TIMESTAMP.sqlite3'"

# Резервна копія медіафайлів
tar -czf "$BACKUP_DIR/media/media_$TIMESTAMP.tar.gz" \
-C /var/www/AnimeGallery/backend/anime_backend media/

# Видалення бекапів старіших за 7 днів
find "$BACKUP_DIR" -type f -mtime +7 -delete

# Синхронізація у хмару (приклад)
# aws s3 sync "$BACKUP_DIR" s3://animegallery-backups/
```

---

### Налаштування cron

```bash
crontab -e
```

```plaintext
0 3 * * * /bin/bash /usr/local/bin/backup_animegallery.sh >> /var/log/backup.log 2>&1
```

---

## 5. Процедура відновлення з резервних копій

### 5.1 Повне відновлення системи (Disaster Recovery)

```bash
git clone https://github.com/Shibitoll/AnimeGallery.git
cd AnimeGallery
sudo systemctl stop animegallery
```

Відновлення бази даних:

```bash
cp /path/to/backup/db_20260326.sqlite3 \
/var/www/AnimeGallery/backend/anime_backend/db.sqlite3
```

Відновлення медіафайлів:

```bash
tar -xzf media_20260326.tar.gz \
-C /var/www/AnimeGallery/backend/anime_backend/
```

Відновлення прав доступу:

```bash
sudo chown -R www-data:www-data /var/www/AnimeGallery/backend/anime_backend/
```

Запуск сервісів:

```bash
sudo systemctl start animegallery
```

---

### 5.2 Вибіркове відновлення файлів

```bash
tar -xzf media_20260326.tar.gz -C /var/tmp/

cp /var/tmp/media/covers/missing_image.jpg \
/var/www/AnimeGallery/backend/anime_backend/media/covers/
```

---

### 5.3 Тестування відновлення (Recovery Drills)

Раз на квартал необхідно:

- розгорнути staging середовище
- виконати повне відновлення з бекапу
- перевірити API та цілісність даних
- задокументувати результати

---

## 6. Додавання документа до репозиторію

```bash
git add docs/backup_strategy.md
git commit -m "docs: add comprehensive backup and disaster recovery strategy

- Defined backup types and retention policy
- Documented SQLite safe backup procedure
- Added automation script and cron configuration
- Included disaster recovery and selective restore procedures"
```