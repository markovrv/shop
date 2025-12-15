# Архитектура проекта: Bookkeeping App

## Структура папок

```
bookkeeping-app/
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.js              # Инициализация и миграции БД
│   │   │   └── connection.js        # Подключение SQLite
│   │   ├── routes/
│   │   │   ├── accounts.js          # Маршруты для счетов
│   │   │   ├── entries.js           # Маршруты для проводок
│   │   │   ├── balances.js          # Маршруты для остатков
│   │   │   └── admin.js             # Административные маршруты
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Глобальная обработка ошибок
│   │   │   └── validator.js         # Валидация данных
│   │   ├── utils/
│   │   │   └── logger.js            # Логирование
│   │   └── index.js                 # Точка входа сервера
│   ├── .env                         # Переменные окружения
│   ├── package.json
│   └── README.md
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.vue           # Шапка приложения
│   │   │   ├── EntriesTable.vue     # Таблица проводок
│   │   │   ├── EntryForm.vue        # Форма добавления/редактирования
│   │   │   ├── AccountsList.vue     # Список счетов
│   │   │   ├── AccountForm.vue      # Форма счета
│   │   │   ├── Balances.vue         # Остатки по счетам
│   │   │   └── FilterPanel.vue      # Фильтры (даты, счета)
│   │   ├── api/
│   │   │   └── client.js            # HTTP клиент (axios)
│   │   ├── stores/
│   │   │   ├── entries.js           # Pinia store для проводок
│   │   │   ├── accounts.js          # Pinia store для счетов
│   │   │   └── ui.js                # Pinia store для UI состояния
│   │   ├── App.vue                  # Главный компонент
│   │   ├── main.js                  # Точка входа
│   │   └── styles/
│   │       └── globals.css          # Глобальные стили
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── ARCHITECTURE.md                  # Этот файл
├── API-DOCS.md                      # API документация
└── .gitignore
```

---

## Технологический стек

### Серверная часть
- **Node.js** — runtime
- **Express** — веб-фреймворк
- **SQLite3** — база данных
- **dotenv** — управление конфигом
- **joi** или **zod** — валидация схем данных

### Клиентская часть
- **Vue 3** — фреймворк (composition API)
- **Vuetify 3** — компоненты и материальный дизайн
- **Vite** — сборщик (быстрый, модерный)
- **Axios** — HTTP клиент
- **Pinia** — state management
- **Day.js** — работа с датами

---

## Основные компоненты и их ответственность

### Серверная часть

#### `/db/connection.js` — Подключение к БД
```javascript
// Инициализирует SQLite, проверяет соединение
export const getDb = () => { /* ... */ }
```

#### `/db/init.js` — Схема БД и миграции
Создает таблицы:
- `accounts` — счета (id, name, type, initialBalance, createdAt, updatedAt)
- `entries` — проводки (id, date, description, debitAccountId, creditAccountId, amount, createdAt, updatedAt)

#### `/routes/accounts.js`
- `GET /api/accounts` — получить все счета
- `POST /api/accounts` — создать счет
- `PUT /api/accounts/:id` — обновить счет
- `DELETE /api/accounts/:id` — удалить счет

#### `/routes/entries.js`
- `GET /api/entries` — журнал с фильтрацией (fromDate, toDate, accountId, pagination)
- `POST /api/entries` — создать проводку
- `PUT /api/entries/:id` — обновить проводку
- `DELETE /api/entries/:id` — удалить проводку

#### `/routes/balances.js`
- `GET /api/balances` — остатки по счетам на дату

#### `/routes/admin.js`
- `POST /api/admin/recalculate` — перепровести все проводки
- `GET /api/admin/health` — статус сервера

#### `/middleware/validator.js`
Валидирует входные данные, проверяет типы, диапазоны.

#### `/middleware/errorHandler.js`
Единая обработка ошибок, логирование, форматирование ответов.

---

### Клиентская часть

#### `/components/EntriesTable.vue`
Таблица проводок с:
- Отображением дебета/кредита с названиями счетов
- Кнопками редактирования и удаления
- Сортировкой по датам
- Реактивным обновлением

#### `/components/EntryForm.vue`
Форма добавления/редактирования проводки:
- Выбор дебета и кредита из dropdown'ов
- Выбор даты (date picker)
- Валидация перед отправкой
- Проверка, что дебет ≠ кредит

#### `/components/FilterPanel.vue`
Фильтры:
- Диапазон дат (from/to)
- Мультиселект по счетам (фильтр по дебету или кредиту)
- Кнопка "Применить" и "Очистить"

#### `/components/AccountsList.vue`
Таблица счетов с:
- Названием, типом, начальным балансом
- Кнопками редактирования и удаления
- Индикатором, что счет используется в проводках

#### `/components/AccountForm.vue`
Форма счета:
- Input для названия
- Dropdown для типа (asset, liability, equity, income, expense)
- Input для начального баланса
- Валидация

#### `/components/Balances.vue`
Таблица остатков:
- Счет, начальный баланс, дебетовый оборот, кредитовый оборот, конечный остаток
- Фильтр по дате
- Расчет балансов в зависимости от типа счета

#### `/stores/entries.js` (Pinia)
```javascript
export const useEntriesStore = defineStore('entries', {
  state: () => ({
    entries: [],
    loading: false,
    error: null,
    filters: { fromDate: null, toDate: null, accountId: null },
    pagination: { page: 1, limit: 50, total: 0 }
  }),
  
  actions: {
    async fetchEntries(filters) { /* ... */ },
    async createEntry(entry) { /* ... */ },
    async updateEntry(id, entry) { /* ... */ },
    async deleteEntry(id) { /* ... */ }
  },
  
  getters: {
    filteredEntries: (state) => state.entries
  }
})
```

#### `/stores/accounts.js` (Pinia)
```javascript
export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchAccounts() { /* ... */ },
    async createAccount(account) { /* ... */ },
    async updateAccount(id, account) { /* ... */ },
    async deleteAccount(id) { /* ... */ }
  }
})
```

#### `/stores/ui.js` (Pinia)
```javascript
export const useUiStore = defineStore('ui', {
  state: () => ({
    currentPage: 'entries', // 'entries' | 'accounts' | 'balances'
    showEntryModal: false,
    showAccountModal: false,
    editingEntry: null,
    editingAccount: null
  })
})
```

#### `/api/client.js`
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`)
}

export const entriesApi = {
  getAll: (params) => api.get('/entries', { params }),
  create: (data) => api.post('/entries', data),
  update: (id, data) => api.put(`/entries/${id}`, data),
  delete: (id) => api.delete(`/entries/${id}`)
}

export const balancesApi = {
  getAll: (date) => api.get('/balances', { params: { date } })
}

export const adminApi = {
  recalculate: () => api.post('/admin/recalculate'),
  health: () => api.get('/admin/health')
}
```

---

## Поток данных

### Создание проводки
1. Пользователь заполняет форму в `EntryForm.vue`
2. Валидация на клиенте (дебет ≠ кредит, сумма > 0)
3. Запрос `POST /api/entries` через axios
4. Сервер валидирует данные, проверяет существование счетов
5. Проводка сохраняется в БД
6. Ответ приходит клиенту
7. Pinia store обновляется через action `createEntry`
8. Vue компонент перерендеривается (реактивность)

### Фильтрация проводок
1. Пользователь устанавливает фильтры в `FilterPanel.vue`
2. Клик на "Применить" → `useEntriesStore().fetchEntries(filters)`
3. Запрос `GET /api/entries?fromDate=...&toDate=...&accountId=...`
4. Сервер выполняет SQL запрос с WHERE условиями
5. Возвращает отфильтрованные проводки с пагинацией
6. Store обновляется, таблица перерендеривается

### Расчет остатков
1. Пользователь открывает вкладку "Остатки"
2. `Balances.vue` вызывает `balancesApi.getAll(date)`
3. Сервер для каждого счета считает:
   - Начальный баланс из `initialBalance`
   - Дебетовый оборот (сумму всех дебетов счета)
   - Кредитовый оборот (сумму всех кредитов счета)
   - Конечный баланс в зависимости от типа счета
4. Таблица отображает результаты

---

## Логика расчета баланса

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

---

## Безопасность и валидация

### На сервере
- **Input validation**: Все входные параметры проверяются через Joi/Zod
- **SQL injection**: Используются prepared statements (встроены в sqlite3)
- **Error handling**: Все ошибки логируются, чувствительная информация не утечет клиенту
- **CORS**: Включен для localhost:3000 и 5173 (Vite)

### На клиенте
- **Form validation**: Vue validation (перед отправкой)
- **XSS protection**: Vue автоматически экранирует текст в templates
- **State management**: Pinia хранит state в памяти (потеря при перезагрузке)

---

## Операция "Перепровести все проводки"

**Эндпоинт:** `POST /api/admin/recalculate`

**Логика:**
1. Сервер получает запрос
2. Проходит по всем проводкам в хронологическом порядке (по дате)
3. Пересчитывает все остатки по счетам
4. Логирует процесс
5. Возвращает количество обработанных проводок

**Когда использовать:**
- При обнаружении несоответствия в балансах
- После импорта данных из другой системы
- При диагностике проблем с целостностью

**Клиент:**
```vue
<template>
  <button @click="handleRecalculate" :disabled="isLoading">
    Перепровести все проводки
  </button>
</template>

<script>
import { useUiStore } from '@/stores/ui'
import { adminApi } from '@/api/client'

export default {
  setup() {
    const uiStore = useUiStore()
    
    const handleRecalculate = async () => {
      if (!confirm('Это действие перепроведет все проводки. Продолжить?')) return
      
      try {
        const response = await adminApi.recalculate()
        uiStore.showSuccess(`Перепроведено ${response.data.data.entriesProcessed} проводок`)
      } catch (error) {
        uiStore.showError(error.message)
      }
    }
    
    return { handleRecalculate }
  }
}
</script>
```

---

## Особенности реализации

### Двойная запись
- Каждая операция увеличивает дебет одного счета и кредит другого на одинаковую сумму
- Валидация: сумма дебета == сумме кредита (автоматическая)
- Сбалансированность: всегда активы = обязательства + капитал

### Пагинация
- По умолчанию 50 проводок на странице
- На фронте можно менять limit
- Сервер возвращает `pagination.total` для расчета кол-ва страниц

### Типы счетов
```
asset (активы): Касса, Расчётный счёт, Товары, Эквайринг
liability (пассивы): Поставщики, Кредиты
equity (капитал): Капитал Владельца 1, Капитал Владельца 2
income (доходы): Выручка, Прочие доходы
expense (расходы): Зарплата, Комиссия, Себестоимость
```

### Хронология
- Проводки можно создавать задним числом
- Фильтры и расчеты учитывают дату документа, не дату создания
- История версий проводок не ведётся

---

## Развертывание

### Локальное развертывание
```bash
# Сервер
cd server
npm install
npm start  # Слушает на port 3000

# Клиент (в отдельном терминале)
cd client
npm install
npm run dev  # Работает на http://localhost:5173
```

### Production развертывание
- Собрать клиент: `npm run build` → `dist/`
- Подать статику с сервера (express.static)
- Использовать переменные окружения для БД пути и портов
- Настроить логирование и мониторинг
- Регулярные резервные копии БД
