```
bookkeeping-app/
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.js
│   │   │   └── init.js
│   │   ├── routes/
│   │   │   ├── accounts.js
│   │   │   ├── entries.js
│   │   │   ├── balances.js
│   │   │   └── admin.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── bookkeeping.db (создается автоматически)
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.vue
│   │   │   ├── EntriesTable.vue
│   │   │   ├── EntryForm.vue
│   │   │   ├── FilterPanel.vue
│   │   │   ├── AccountsList.vue
│   │   │   ├── AccountForm.vue
│   │   │   ├── Balances.vue
│   │   │   └── SettingsPanel.vue
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── stores/
│   │   │   ├── entries.js
│   │   │   ├── accounts.js
│   │   │   └── ui.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── API-DOCS.md
├── ARCHITECTURE.md
├── README.md
└── .gitignore
```

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
# Сервер
cd server
npm install

# Клиент (в отдельном терминале)
cd client
npm install
```

### 2. Запустить сервер

```bash
cd server
npm start
# Сервер будет работать на http://localhost:3000
```

### 3. Запустить клиент

```bash
cd client
npm run dev
# Приложение будет доступно на http://localhost:5173
```

### 4. Открыть в браузере

```
http://localhost:5173
```

## Основные команды

### Сервер
```bash
npm start       # Запустить сервер
npm test        # Запустить тесты (если есть)
```

### Клиент
```bash
npm run dev     # Запустить в dev режиме
npm run build   # Собрать для production
npm run preview # Предпросмотр production сборки
```

## Примеры использования API с curl

### Создать счет
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Касса",
    "type": "asset",
    "initialBalance": 50000
  }'
```

### Создать проводку
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-14",
    "description": "Продажа товара",
    "debitAccountId": 1,
    "creditAccountId": 2,
    "amount": 1000
  }'
```

### Получить все проводки
```bash
curl http://localhost:3000/api/entries
```

### Получить проводки с фильтром по датам
```bash
curl "http://localhost:3000/api/entries?fromDate=2025-12-01&toDate=2025-12-31"
```

### Получить остатки по счетам
```bash
curl http://localhost:3000/api/balances
```

### Перепровести все проводки (администрирование)
```bash
curl -X POST http://localhost:3000/api/admin/recalculate
```

## Структура базы данных

### Таблица accounts
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  initialBalance REAL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Типы счетов: asset, liability, equity, income, expense
```

### Таблица entries
```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  debitAccountId INTEGER NOT NULL,
  creditAccountId INTEGER NOT NULL,
  amount REAL NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (debitAccountId) REFERENCES accounts(id),
  FOREIGN KEY (creditAccountId) REFERENCES accounts(id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_debitAccountId ON entries(debitAccountId);
CREATE INDEX idx_entries_creditAccountId ON entries(creditAccountId);
```

## Особенности приложения

✅ **Двойная запись** — каждая проводка сбалансирована (дебет = кредит)
✅ **Фильтрация** — по датам и счетам
✅ **Управление счетами** — создание, редактирование, удаление
✅ **Остатки** — автоматический расчет на любую дату
✅ **Редактирование** — любой проводки со следующим пересчетом балансов
✅ **Перепроведение** — команда для пересчета всех проводок
✅ **Адаптивный дизайн** — работает на мобильных и десктопах (Vuetify)
✅ **SQLite** — простая, встроенная база данных, не требует отдельного сервера

## Структура кода

### Сервер (Node.js + Express + SQLite)
- **Простая архитектура** — маршруты → логика → БД
- **Middleware** — валидация, ошибки, логирование
- **Подготовленные запросы** — защита от SQL injection
- **CORS** — включен для desarrollo и production

### Клиент (Vue 3 + Vuetify + Pinia)
- **Composition API** — современный синтаксис Vue
- **Пагинация** — для больших списков проводок
- **Реактивность** — автоматическое обновление UI
- **Валидация** — на клиенте и сервере
- **Темная тема** — встроенная поддержка Vuetify

## Технические характеристики

| Характеристика | Значение |
|---|---|
| Node.js версия | 18+ |
| Vue версия | 3+ |
| Vuetify версия | 3+ |
| SQLite версия | 3+ |
| Поддерживаемые браузеры | Chrome, Firefox, Safari, Edge |

## Troubleshooting

### "Port 3000 is already in use"
```bash
# Найти процесс на порту
lsof -i :3000

# Убить процесс
kill -9 <PID>

# Или использовать другой порт в .env
PORT=3001
```

### "Cannot find module 'sqlite3'"
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

### "CORS error"
- Убедитесь, что сервер работает на http://localhost:3000
- Проверьте CORS настройки в server/src/index.js
- Убедитесь, что клиент подключается к правильному базовому URL в api/client.js

### "Database is locked"
- SQLite не любит одновременные записи
- Переустартите приложение
- Если проблема сохранится, пересчитайте базу через admin/recalculate

## Рекомендации по использованию

1. **Регулярно сохраняйте резервные копии БД** (`bookkeeping.db`)
2. **Проверяйте консоль браузера** на наличие ошибок
3. **Используйте фильтры** для работы с большим объемом данных
4. **Перепровеставляйте время от времени** через admin панель
5. **Начните с нескольких тестовых счетов** перед работой с реальными данными

## Лицензия

MIT

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера (консоль Node.js)
2. Проверьте консоль браузера (F12 → Console)
3. Убедитесь, что оба сервера (Node и Vite) запущены
4. Попробуйте `POST /api/admin/recalculate`
5. Перезагрузите приложение (Ctrl+Shift+R в браузере)
```

---

## Следующие шаги

Для полного запуска приложения вам также потребуются:

1. **Реализация серверных маршрутов** (`server/src/routes/*.js`)
2. **Компоненты Vue** (`client/src/components/*.vue`)
3. **Pinia stores** (`client/src/stores/*.js`)
4. **API клиент** (`client/src/api/client.js`)
5. **Конфигурационные файлы** (`package.json`, `vite.config.js`, `.env`)

Все они могут быть созданы на основе ARCHITECTURE.md и API-DOCS.md документации.
