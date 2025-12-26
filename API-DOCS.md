# API Документация — Приложение учёта проводок

## Общие сведения

**Базовый URL:** `http://localhost:3000/api`

**Формат ответов:** JSON

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Статус коды:**
- `200` — успешно
- `201` — создано
- `400` — ошибка валидации
- `401` — неавторизованный доступ
- `404` — не найдено
- `409` — конфликт (например, при попытке удалить счёт с проводками)
- `500` — ошибка сервера

---

## Счета (Accounts)

### GET /accounts
Получить список всех счетов.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры:** нет

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Касса",
      "type": "asset",
      "initialBalance": 10000,
      "createdAt": "2025-12-14T20:00:00.000Z"
    }
  ]
}
```

---

### POST /accounts
Создать новый счет.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Тело запроса:**
```json
{
  "name": "Касса",
  "type": "asset",
  "initialBalance": 10000
}
```

**Поля:**
- `name` (строка, обязательно) — название счета
- `type` (строка, обязательно) — тип счета: `asset`, `liability`, `equity`, `income`, `expense`
- `initialBalance` (число, опционально, по умолчанию 0) — начальный остаток

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Касса",
    "type": "asset",
    "initialBalance": 10000,
    "createdAt": "2025-12-14T20:00:00.000Z"
  }
}
```

---

### PUT /accounts/:id
Обновить счет.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID счета

**Тело запроса:**
```json
{
  "name": "Касса (обновленная)",
  "initialBalance": 15000
}
```

**Поля:**
- `name` (строка, опционально)
- `initialBalance` (число, опционально)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Касса (обновленная)",
    "type": "asset",
    "initialBalance": 15000,
    "updatedAt": "2025-12-14T20:30:00.000Z"
  }
}
```

---

### DELETE /accounts/:id
Удалить счет.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID счета

**Условие:** счет не должен содержать проводок

**Ответ:**
```json
{
  "success": true,
  "message": "Счет удален"
}
```

---

## Проводки (Entries)
### GET /entries
Получить журнал проводок с фильтрацией.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Query параметры:**
- `fromDate` (ISO 8601, опционально) — дата начала (YYYY-MM-DD)
- `toDate` (ISO 8601, опционально) — дата конца (YYYY-MM-DD)
- `accountId` (число, опционально) — фильтр по счету (дебет или кредит)
- `document` (число, опционально) — фильтр по документу
- `page` (число, по умолчанию 1) — номер страницы
- `limit` (число, по умолчанию 50) — записей на странице


**Пример:**
```
GET /entries?fromDate=2025-12-01&toDate=2025-12-14&accountId=1&page=1&limit=20
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2025-12-14",
      "description": "Продажа за наличные",
      "debitAccountId": 1,
      "debitAccountName": "Касса",
      "creditAccountId": 2,
      "creditAccountName": "Выручка",
      "amount": 1000,
      "createdAt": "2025-12-14T20:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### POST /entries
Создать новую проводку.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Тело запроса:**
```json
{
  "date": "2025-12-14",
  "description": "Продажа за наличные",
  "debitAccountId": 1,
  "creditAccountId": 2,
  "amount": 1000
}
```

**Поля:**
- `date` (строка, обязательно) — дата в формате YYYY-MM-DD
- `description` (строка, обязательно) — описание проводки
- `debitAccountId` (число, обязательно) — ID счета по дебету
- `creditAccountId` (число, обязательно) — ID счета по кредиту
- `amount` (число, обязательно, > 0) — сумма проводки

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2025-12-14",
    "description": "Продажа за наличные",
    "debitAccountId": 1,
    "debitAccountName": "Касса",
    "creditAccountId": 2,
    "creditAccountName": "Выручка",
    "amount": 1000,
    "createdAt": "2025-12-14T20:00:00.000Z"
  }
}
```

---

### PUT /entries/:id
Обновить проводку.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID проводки

**Тело запроса:**
```json
{
  "date": "2025-12-14",
  "description": "Продажа за наличные (обновлено)",
  "amount": 1200
}
```

**Поля:**
- `date` (строка, опционально)
- `description` (строка, опционально)
- `amount` (число, опционально)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2025-12-14",
    "description": "Продажа за наличные (обновлено)",
    "debitAccountId": 1,
    "debitAccountName": "Касса",
    "creditAccountId": 2,
    "creditAccountName": "Выручка",
    "amount": 1200,
    "updatedAt": "2025-12-14T20:30:00.000Z"
  }
}
```

---

### DELETE /entries/:id
Удалить проводку.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID проводки

**Ответ:**
```json
{
  "success": true,
  "message": "Проводка удалена"
}
```

---

## Остатки по счетам (Account Balances)

### GET /balances
Получить остатки по всем счетам за определённый период.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Query параметры:**
- `startDate` (ISO 8601, опционально) — начальная дата периода (по умолчанию: 200-01-01)
- `endDate` (ISO 8601, опционально) — конечная дата периода (по умолчанию: текущая дата)

**Пример:**
```
GET /balances?startDate=2025-01-01&endDate=2025-12-14
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "accountId": 1,
      "accountName": "Касса",
      "accountType": "asset",
      "initialBalance": 10000,
      "debitSum": 5000,
      "creditSum": 3000,
      "balance": 12000
    }
  ],
  "startDate": "2025-01-01",
  "endDate": "2025-12-14"
}
```

**Логика:**
- Для активов (asset): `balance = initialBalance + дебет - кредит`
- Для пассивов (liability): `balance = initialBalance + кредит - дебет`
- Для капитала (equity): `balance = initialBalance + кредит - дебет`
- Для доходов (income): `balance = кредит` (показывает оборот)
- Для расходов (expense): `balance = дебет` (показывает оборот)

---
## Администрирование
### POST /admin/recalculate
Перепровести все проводки и пересчитать остатки.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`


**Параметры:** нет

**Назначение:** используется при нарушении целостности данных или для пересчета балансов

**Ответ:**
```json
{
  "success": true,
  "message": "Все проводки перепроведены успешно",
  "data": {
    "entriesProcessed": 150,
    "accountsRecalculated": 12
  }
}
```

---
### GET /admin/health
Проверка здоровья сервера.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`


**Ответ:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "accountsTotal": 5,
    "entriesTotal": 25,
    "uptime": 3600,
    "timestamp": "2025-12-26T10:00:00.000Z"
  }
}
```


---

## Коды ошибок

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "amount": "Must be a positive number"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access denied. Invalid or missing token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Entry not found"
}
```

### 409 Conflict
```json
{
  "success": false,
 "error": "Cannot delete account with existing entries"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Примеры использования

### Создать счет и внести начальный баланс
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Касса",
    "type": "asset",
    "initialBalance": 50000
  }'
```

### Создать проводку: продажа за наличные
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-14",
    "description": "Продажа товара за наличные",
    "debitAccountId": 1,
    "creditAccountId": 3,
    "amount": 1000
  }'
```

### Получить остатки на дату
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/balances?date=2025-12-14
```

### Фильтрованный список проводок
```bash
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/entries?fromDate=2025-12-01&toDate=2025-12-31&accountId=1"
```

---
## Аутентификация

Для доступа к API требуется JWT токен, который должен быть передан в заголовке `Authorization` в формате `Bearer <token>`.

### POST /auth/login
Аутентификация пользователя и получение JWT токена.

**Аутентификация:** Не требуется

**Тело запроса:**
```json
{
  "login": "admin",
  "password": "admin"
}
```

**Поля:**
- `login` (строка, обязательно) — логин пользователя (по умолчанию 'admin')
- `password` (строка, обязательно) — пароль пользователя (по умолчанию 'admin')

**Ответ при успешной аутентификации:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "login": "admin"
  }
}
```

**Ответ при ошибке аутентификации:**
```json
{
  "error": "Invalid login or password"
}
```

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "admin"
  }'
```

---

## Владельцы (Owners)

### GET /owners
Получить список всех владельцев.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры:** нет

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Иванов Иван",
      "email": "ivanov@example.com",
      "phone": "+79001234567",
      "notes": "Основной владелец",
      "personal_account_id": 1,
      "revenue_account_id": 2,
      "cash_account_id": 3,
      "bank_account_id": 4,
      "createdAt": "2025-12-14T20:00.000Z"
    }
  ]
}
```

---

### GET /owners/:id
Получить конкретного владельца.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID владельца

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Иванов Иван",
    "email": "ivanov@example.com",
    "phone": "+79001234567",
    "notes": "Основной владелец",
    "personal_account_id": 1,
    "revenue_account_id": 2,
    "cash_account_id": 3,
    "bank_account_id": 4,
    "createdAt": "2025-12-14T20:00.000Z",
    "updatedAt": "2025-12-14T20:30:00.000Z"
  }
}
```

---

### POST /owners
Создать нового владельца.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Валидационные требования:**
- `name` — обязательно, не может быть пустым
- `email` — опционально, должно быть корректным email адресом если указано
- `phone` — опционально
- `notes` — опционально
- `personal_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `revenue_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `cash_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `bank_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету

**Тело запроса:**
```json
{
  "name": "Иванов Иван",
  "email": "ivanov@example.com",
  "phone": "+79001234567",
  "notes": "Основной владелец",
  "personal_account_id": 1,
  "revenue_account_id": 2,
  "cash_account_id": 3,
  "bank_account_id": 4
}
```

**Поля:**
- `name` (строка, обязательно) — имя владельца
- `email` (строка, опционально) — email владельца (должен быть валидным email адресом если указан)
- `phone` (строка, опционально) — телефон владельца
- `notes` (строка, опционально) — дополнительные заметки
- `personal_account_id` (число, опционально) — ID личного счета владельца
- `revenue_account_id` (число, опционально) — ID счета доходов владельца
- `cash_account_id` (число, опционально) — ID кассового счета владельца
- `bank_account_id` (число, опционально) — ID банковского счета владельца
**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Иванов Иван",
    "email": "ivanov@example.com",
    "phone": "+79001234567",
    "notes": "Основной владелец",
    "personal_account_id": 1,
    "revenue_account_id": 2,
    "cash_account_id": 3,
    "bank_account_id": 4,
    "createdAt": "2025-12-14T20:00.000Z"
  }
}
```


---

### PUT /owners/:id
Обновить владельца.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Валидационные требования:**
- `name` — опционально, если указано, не должно быть пустым
- `email` — опционально, должно быть корректным email адресом если указано
- `phone` — опционально
- `notes` — опционально
- `personal_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `revenue_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `cash_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `bank_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету

**Параметры пути:**
- `id` (число) — ID владельца

**Тело запроса:**
```json
{
  "name": "Иванов Иван",
  "email": "ivanov@example.com",
  "phone": "+79001234567",
  "notes": "Основной владелец",
  "personal_account_id": 1,
  "revenue_account_id": 2,
  "cash_account_id": 3,
  "bank_account_id": 4
}
```

**Поля:**
- `name` (строка) — имя владельца
- `email` (строка, опционально) — email владельца (должен быть валидным email адресом если указан)
- `phone` (строка, опционально) — телефон владельца
- `notes` (строка, опционально) — дополнительные заметки
- `personal_account_id` (число, опционально) — ID личного счета владельца
- `revenue_account_id` (число, опционально) — ID счета доходов владельца
- `cash_account_id` (число, опционально) — ID кассового счета владельца
- `bank_account_id` (число, опционально) — ID банковского счета владельца

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Иванов Иван",
    "email": "ivanov@example.com",
    "phone": "+79001234567",
    "notes": "Основной владелец",
    "createdAt": "2025-12-14T20:00:00.000Z",
    "updatedAt": "2025-12-14T20:30:00.000Z"
 }
}
```

---

### DELETE /owners/:id
Удалить владельца.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID владельца

**Ответ:**
```json
{
  "success": true,
  "message": "Владелец удален"
}
```

---
 
## Сотрудники (Employees)
 
### GET /employees
Получить список всех сотрудников.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры:** нет

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Петров Петр",
      "phone": "+79001234567",
      "email": "petrov@example.com",
      "daily_salary": 1000,
      "bonus_percentage": 10,
      "salary_account_id": 1,
      "personal_account_id": 2,
      "createdAt": "2025-12-14T20:00.000Z"
    }
  ]
}
```

---

### GET /employees/:id
Получить конкретного сотрудника.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID сотрудника

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Петров Петр",
    "phone": "+79001234567",
    "email": "petrov@example.com",
    "daily_salary": 1000,
    "bonus_percentage": 10,
    "salary_account_id": 1,
    "personal_account_id": 2,
    "createdAt": "2025-12-14T20:00.000Z",
    "updatedAt": "2025-12-14T20:30:00.000Z"
  }
}
```

---

### POST /employees
Создать нового сотрудника.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Валидационные требования:**
- `name` — обязательно, не может быть пустым
- `phone` — опционально
- `email` — опционально, должно быть корректным email адресом если указано
- `daily_salary` — опционально, должно быть положительным числом если указано
- `bonus_percentage` — опционально, должно быть числом от 0 до 100 если указано
- `salary_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `personal_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету

**Тело запроса:**
```json
{
  "name": "Петров Петр",
  "phone": "+79001234567",
  "email": "petrov@example.com",
  "daily_salary": 1000,
  "bonus_percentage": 10,
  "salary_account_id": 1,
  "personal_account_id": 2
}
```

**Поля:**
- `name` (строка, обязательно) — имя сотрудника
- `phone` (строка, опционально) — телефон сотрудника
- `email` (строка, опционально) — email сотрудника (должен быть валидным email адресом если указан)
- `daily_salary` (число, опционально) — размер заработной платы в день (положительное значение)
- `bonus_percentage` (число, опционально) — размер премии в процентах (значение от 0 до 100)
- `salary_account_id` (число, опционально) — ID счета учёта заработной платы
- `personal_account_id` (число, опционально) — ID личного счета сотрудника

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Петров Петр",
    "phone": "+79001234567",
    "email": "petrov@example.com",
    "daily_salary": 1000,
    "bonus_percentage": 10,
    "salary_account_id": 1,
    "personal_account_id": 2,
    "createdAt": "2025-12-14T20:00.000Z"
  }
}
```

---

### PUT /employees/:id
Обновить сотрудника.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Валидационные требования:**
- `name` — опционально, если указано, не должно быть пустым
- `phone` — опционально
- `email` — опционально, должно быть корректным email адресом если указано
- `daily_salary` — опционально, должно быть положительным числом если указано
- `bonus_percentage` — опционально, должно быть числом от 0 до 100 если указано
- `salary_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету
- `personal_account_id` — опционально, должно быть положительным числом и соответствовать существующему счету

**Параметры пути:**
- `id` (число) — ID сотрудника

**Тело запроса:**
```json
{
  "name": "Петров Петр",
  "phone": "+79001234567",
  "email": "petrov@example.com",
  "daily_salary": 1200,
  "bonus_percentage": 15,
  "salary_account_id": 1,
  "personal_account_id": 2
}
```

**Поля:**
- `name` (строка) — имя сотрудника
- `phone` (строка, опционально) — телефон сотрудника
- `email` (строка, опционально) — email сотрудника (должен быть валидным email адресом если указан)
- `daily_salary` (число, опционально) — размер заработной платы в день (положительное значение)
- `bonus_percentage` (число, опционально) — размер премии в процентах (значение от 0 до 100)
- `salary_account_id` (число, опционально) — ID счета учёта заработной платы
- `personal_account_id` (число, опционально) — ID личного счета сотрудника

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Петров Петр",
    "phone": "+79001234567",
    "email": "petrov@example.com",
    "daily_salary": 1200,
    "bonus_percentage": 15,
    "salary_account_id": 1,
    "personal_account_id": 2,
    "createdAt": "2025-12-14T20:00.000Z",
    "updatedAt": "2025-12-14T20:30:00.000Z"
  }
}
```

---

### DELETE /employees/:id
Удалить сотрудника.

**Аутентификация:** Требуется JWT токен в заголовке `Authorization: Bearer <token>`

**Параметры пути:**
- `id` (число) — ID сотрудника

**Ответ:**
```json
{
  "success": true,
  "message": "Сотрудник удален"
}
```

---

## Примечания

- Все даты передаются и возвращаются в формате ISO 8601 (YYYY-MM-DD для дат, полный ISO для timestamps)
- Числовые значения (суммы) хранятся как целые числа в копейках или минимальных единицах для точности
- Удаление объектов необратимо
- История изменений проводок не ведётся (изменение перезаписывает старые значения)
- Все endpoint'ы, кроме `/auth/login`, требуют аутентификации через JWT токен
- Токен действителен 10 лет с момента выдачи

