# Bookkeeping Server

Серверная часть приложения для учета финансовых проводок.

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env` в корне проекта:

```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./bookkeeping.db
```

## Запуск

```bash
# Для разработки
npm run dev

# Для продакшена
npm start
```

## Структура проекта

```
server/
├── src/
│   ├── db/                 # Подключение и инициализация базы данных
│   │   ├── connection.js   # Подключение к SQLite
│   │   └── init.js         # Инициализация таблиц
│   ├── routes/             # Маршруты API
│   │   ├── accounts.js     # Управление счетами
│   │   ├── entries.js      # Управление проводками
│   │   ├── balances.js     # Расчет остатков
│   │   └── admin.js        # Административные функции
│   ├── middleware/         # Middleware
│   │   ├── errorHandler.js # Обработка ошибок
│   │   └── validator.js    # Валидация данных
│   ├── utils/              # Утилиты
│   │   └── logger.js       # Логирование
│   └── index.js            # Основной файл сервера
├── .env                    # Переменные окружения
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Счета
- `GET /api/accounts` - получить все счета
- `POST /api/accounts` - создать счет
- `PUT /api/accounts/:id` - обновить счет
- `DELETE /api/accounts/:id` - удалить счет

### Проводки
- `GET /api/entries` - получить проводки с фильтрацией
- `POST /api/entries` - создать проводку
- `PUT /api/entries/:id` - обновить проводку
- `DELETE /api/entries/:id` - удалить проводку

### Остатки
- `GET /api/balances` - получить остатки по счетам

### Администрирование
- `POST /api/admin/recalculate` - перепровести все проводки
- `GET /api/admin/health` - проверка состояния сервера

## Зависимости

- express - веб-фреймворк
- sqlite3 - база данных
- cors - настройки CORS
- dotenv - переменные окружения
- zod - валидация данных