#!/bin/bash
# Скрипт для швидкого резервного копіювання бази даних AnimeGallery

# Переходимо в корінь проєкту (на випадок, якщо скрипт запущено з папки scripts)
cd "$(dirname "$0")/.."

TIMESTAMP=$(date +"%Y%m%d_%H%M")
BACKUP_DIR="./backups"

# Створюємо папку для бекапів, якщо її немає
mkdir -p $BACKUP_DIR

# Копіюємо базу
cp ./backend/anime_backend/db.sqlite3 $BACKUP_DIR/db.sqlite3.bak_$TIMESTAMP

echo "✅ Backup created successfully: $BACKUP_DIR/db.sqlite3.bak_$TIMESTAMP"