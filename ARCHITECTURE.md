# Архитектура проекта: Bookkeeping App

## Общее описание проекта

Bookkeeping App — это веб-приложение для управления бухгалтерскими проводками, счетами и остатками. Приложение реализует систему двойной бухгалтерской записи, где каждая финансовая операция отражается как по дебету одного счета, так и по кредиту другого. Приложение разработано на Node.js (backend) и Vue.js (frontend) с использованием SQLite в качестве базы данных.

### Функциональность приложения:
- Управление счетами (создание, редактирование, удаление)
- Ведение проводок с возможностью фильтрации и пагинации
- Расчет остатков по счетам на любую дату
- Административные функции (перепроведение проводок, проверка состояния системы)
- Аутентификация пользователей

## Структура проекта

```
bookkeeping-app/
├── server/                      # Backend приложения
│   ├── src/
│   │   ├── db/                  # Подключение и инициализация БД
│   │   ├── routes/              # API маршруты
│   │   ├── middleware/          # Валидация, аутентификация, обработка ошибок
│   │   ├── utils/               # Утилиты (логирование)
│   │   └── index.js             # Точка входа сервера
│   ├── package.json
│   └── README.md
│
├── client/                      # Frontend приложения
│   ├── src/
│   │   ├── components/          # Vue компоненты
│   │   ├── pages/               # Страницы приложения
│   │   ├── stores/              # Pinia хранилища
│   │   ├── api/                 # HTTP клиент
│   │   ├── router/              # Роутинг приложения
│   │   ├── assets/              # Статические ресурсы
│   │   ├── App.vue              # Главный компонент
│   │   └── main.js              # Точка входа
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── API-DOCS.md                  # Документация REST API
├── ARCHITECTURE.md              # Архитектура и дизайн (этот файл)
├── DEPLOYMENT.md                # Пошаговое руководство запуска
└── README.md                    # Описание проекта
```

## Технологии, используемые в проекте

### Backend:
- **Node.js** — серверная платформа
- **Express** — веб-фреймворк для создания REST API
- **MySQL** — реляционная база данных (вместо SQLite как указано в README)
- **mysql2** — драйвер для подключения к MySQL
- **dotenv** — управление переменными окружения
- **zod** — валидация данных
- **jsonwebtoken** — аутентификация и авторизация
- **bcryptjs** — хеширование паролей
- **cors** — настройка политики CORS
- **axios** — HTTP клиент

### Frontend:
- **Vue 3** — фреймворк (composition API)
- **Vuetify 3** — компоненты Material Design
- **Vite** — сборщик проекта
- **Axios** — HTTP клиент
- **Pinia** — управление состоянием
- **vue-router** — маршрутизация
- **@mdi/font** — иконки Material Design
- **vuex** — альтернативное управление состоянием (не используется в проекте, но присутствует в зависимостях)

## Описание основных компонентов frontend части

### Vue компоненты:
- **[`App.vue`](client/src/App.vue:1)** — главный компонент приложения, содержит навигационное меню, шапку и основной контент
- **[`EntriesTable.vue`](client/src/components/EntriesTable.vue:1)** — таблица проводок с возможностью сортировки и пагинации
- **[`EntryFormModal.vue`](client/src/components/EntryFormModal.vue:1)** — модальное окно для создания/редактирования проводок
- **[`AccountFormModal.vue`](client/src/components/AccountFormModal.vue:1)** — модальное окно для создания/редактирования счетов
- **[`FilterPanel.vue`](client/src/components/FilterPanel.vue:1)** — панель фильтров для проводок
- **[`SettingsModal.vue`](client/src/components/SettingsModal.vue:1)** — модальное окно с настройками приложения
- **[`LoginPage.vue`](client/src/pages/LoginPage.vue:1)** — страница аутентификации пользователя

### Страницы приложения:
- **[`EntriesPage.vue`](client/src/pages/EntriesPage.vue:1)** — страница с журналом проводок
- **[`AccountsPage.vue`](client/src/pages/AccountsPage.vue:1)** — страница управления счетами
- **[`BalancesPage.vue`](client/src/pages/BalancesPage.vue:1)** — страница отображения остатков по счетам
- **[`LoginPage.vue`](client/src/pages/LoginPage.vue:1)** — страница входа в систему

### Pinia хранилища:
- **[`accounts.js`](client/src/stores/accounts.js:1)** — управление данными счетов
  - Состояние: `accounts`, `loading`, `error`
  - Действия: `fetchAccounts`, `createAccount`, `updateAccount`, `deleteAccount`
 - Геттеры: `accountOptions` (для селектов)

- **[`entries.js`](client/src/stores/entries.js:1)** — управление данными проводок
  - Состояние: `entries`, `loading`, `error`, `filters`, `pagination`, `sortField`, `sortDirection`
  - Действия: `fetchEntries`, `createEntry`, `updateEntry`, `deleteEntry`, `setFilters`, `clearFilters`

- **[`ui.js`](client/src/stores/ui.js:1)** — управление UI состоянием
  - Состояние: `userLoginState`, `showEntryModal`, `showAccountModal`, `editingEntry`, `editingAccount`, `snackbar`
  - Действия: `setUserLoginState`, `openEntryModal`, `closeEntryModal`, `openAccountModal`, `closeAccountModal`, `showSuccess`, `showError`

### API клиент:
- **[`client.js`](client/src/api/client.js:1)** — HTTP клиент с настройками и перехватчиками
  - Использует axios с базовым URL
  - Добавляет токен аутентификации каждому запросу
  - Обрабатывает ошибки и перенаправляет при 401
  - Экспортирует API для разных сущностей: `authApi`, `accountsApi`, `entriesApi`, `balancesApi`, `adminApi`

### Роутинг:
- **[`router/index.js`](client/src/router/index.js:1)** — настройка маршрутов приложения
  - Защита маршрутов требует аутентификации
  - Перенаправление на страницу входа при отсутствии токена

## Описание основных компонентов backend части

### Маршруты:
- **[`routes/accounts.js`](server/src/routes/accounts.js:1)** — API для управления счетами
  - `GET /api/accounts` — получить все счета
  - `POST /api/accounts` — создать счет
  - `PUT /api/accounts/:id` — обновить счет
  - `DELETE /api/accounts/:id` — удалить счет

- **[`routes/entries.js`](server/src/routes/entries.js:1)** — API для управления проводками
  - `GET /api/entries` — получить проводки с фильтрацией и пагинацией
  - `POST /api/entries` — создать проводку
  - `PUT /api/entries/:id` — обновить проводку
 - `DELETE /api/entries/:id` — удалить проводку

- **[`routes/balances.js`](server/src/routes/balances.js:1)** — API для расчета остатков
  - `GET /api/balances` — получить остатки по счетам за период

- **[`routes/admin.js`](server/src/routes/admin.js:1)** — административные функции
  - `POST /api/admin/recalculate` — перепровести все проводки
  - `GET /api/admin/health` — проверка состояния сервера

- **[`routes/auth.js`](server/src/routes/auth.js:1)** — аутентификация
  - `POST /api/auth/login` — аутентификация пользователя

### Middleware:
- **[`middleware/auth.js`](server/src/middleware/auth.js:1)** — аутентификация JWT токенов
- **[`middleware/validator.js`](server/src/middleware/validator.js:1)** — валидация входных данных с использованием Zod
- **[`middleware/errorHandler.js`](server/src/middleware/errorHandler.js:1)** — глобальная обработка ошибок

### База данных:
- **[`db/connection.js`](server/src/db/connection.js:1)** — подключение к MySQL через пул соединений
- **[`db/init.js`](server/src/db/init.js:1)** — инициализация базы данных и создание таблиц

### Утилиты:
- **[`utils/logger.js`](server/src/utils/logger.js:1)** — логирование событий

### Таблицы базы данных:
- **`accounts`** — хранит информацию о счетах
  - `id` — идентификатор
  - `name` — название счета
 - `type` — тип счета (asset, liability, equity, income, expense)
  - `initialBalance` — начальный баланс
  - `createdAt`, `updatedAt` — даты создания и обновления

- **`entries`** — хранит информацию о проводках
  - `id` — идентификатор
  - `date` — дата проводки
  - `description` — описание проводки
  - `debitAccountId` — ID дебетового счета
  - `creditAccountId` — ID кредитового счета
  - `amount` — сумма проводки
  - `document` — номер документа
  - `createdAt`, `updatedAt` — даты создания и обновления

## Архитектурные паттерны и принципы

### Frontend:
- **MVVM (Model-View-ViewModel)** — Vue.js реализует паттерн MVVM, где компоненты Vue выступают в роли View, а Pinia хранилища как ViewModel
- **Разделение ответственности** — компоненты, страницы и хранилища имеют четко определенные функции
- **Состояние как источник истины** — Pinia обеспечивает централизованное управление состоянием
- **Реактивность** — изменения в состоянии автоматически отражаются в UI
- **Композиционный API** — позволяет группировать связанную логику в функции

### Backend:
- **REST API** — архитектурный стиль для взаимодействия с frontend
- **Разделение на слои** — роуты, middleware и логика работы с базой данных разделены
- **Middleware паттерн** — обработка запросов через цепочку middleware
- **Валидация на входе** — все входные данные валидируются до обработки
- **Безопасность** — аутентификация JWT токенами, проверка доступа

## Связи между различными компонентами системы

### Frontend связи:
- **[`App.vue`](client/src/App.vue:1)** использует [`router-view`](client/src/App.vue:47) для отображения страниц
- **Страницы** используют компоненты (например, [`EntriesPage.vue`](client/src/pages/EntriesPage.vue:15) использует [`FilterPanel`](client/src/pages/EntriesPage.vue:15), [`EntriesTable`](client/src/pages/EntriesPage.vue:17), [`EntryFormModal`](client/src/pages/EntriesPage.vue:19))
- **Компоненты** взаимодействуют с хранилищами Pinia для получения и изменения данных
- **Хранилища** используют API клиент для взаимодействия с сервером
- **API клиент** отправляет запросы на сервер и обрабатывает ответы

### Backend связи:
- **[`index.js`](server/src/index.js:1)** регистрирует middleware и подключает роуты
- **Роуты** используют middleware для аутентификации и валидации
- **Middleware** обрабатывает запросы и передает управление следующему обработчику
- **Функции работы с БД** используются в роутах для выполнения SQL запросов
- **Связи между таблицами** определены через внешние ключи (счета в проводках)

### Frontend-Backend связи:
- **HTTP API** — frontend использует REST API для взаимодействия с backend
- **Аутентификация** — токен в заголовке Authorization для защиты маршрутов
- **Формат данных** — JSON для обмена информацией
- **CORS** — разрешает доступ с frontend домена к backend API

## Особенности реализации

### Логика двойной записи:
- Каждая проводка увеличивает дебет одного счета и кредит другого на одинаковую сумму
- Проверка: дебетовый счет ≠ кредитовый счет
- Проверка: сумма дебета = сумме кредита

### Логика расчета баланса:
```javascript
function calculateBalance(account, fromDate, toDate) {
  const debitSum = db.sum('entries where debitAccountId = ? and date between ? and ?')
  const creditSum = db.sum('entries where creditAccountId = ? and date between ? and ?')
  
  let balance
  switch (account.type) {
    case 'asset':
    case 'expense':
      balance = account.initialBalance + debitSum - creditSum
      break
    case 'liability':
    case 'equity':
    case 'income':
      balance = account.initialBalance + creditSum - debitSum
      break
  }
  
  return balance
}
```

### Безопасность:
- **На сервере**: валидация всех входных данных, защита от SQL-инъекций (через подготовленные выражения), CORS, обработка и логирование ошибок
- **На клиенте**: валидация форм перед отправкой, XSS защита (автоматическая в Vue), правильное управление состоянием

### Аутентификация:
- Используется JWT токены для аутентификации
- Токен хранится в sessionStorage
- Автоматический выход при 401 ошибке
- Защита маршрутов и API endpoint'ов
