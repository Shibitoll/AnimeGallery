# Інструкція з генерації документації

У проєкті AnimeGallery документація генерується автоматично для:
- **backend (Python/Django)** за допомогою **pdoc**
- **frontend (React/JavaScript)** за допомогою **JSDoc**

---

# 1. Генерація документації для backend (pdoc)

## 1.1 Активація віртуального середовища

```bash
cd backend
venv\Scripts\activate
```

---

## 1.2 Встановлення pdoc

```bash
pip install pdoc
```

Після встановлення з’явиться повідомлення:

```
Successfully installed markdown2 pdoc
```

---

## 1.3 Генерація документації

У проєкті використовується скрипт:

```bash
python pdoc_init.py
```

Після виконання документація генерується у папку:

```
docs/backend_html
```

У консолі відображається:

```
Документацію бекенду успішно згенеровано у папку docs/backend_html
```

---

# 2. Генерація документації для frontend (JSDoc)

## 2.1 Встановлення JSDoc

У кореневій папці проєкту:

```bash
npm install --save-dev jsdoc
```

---

## 2.2 Генерація документації

```bash
npx jsdoc -c jsdoc.json
```

Після виконання документація генерується у папку:

```
docs/frontend
```

---