# API Документация — Приложение учёта проводок

## Общие сведения

**Базовый URL:** `http://localhost:3000/api`

**Формат ответов:** JSON

**Аутентификация:** Не требуется (локальное приложение)

**Статус коды:**
- `200` — успешно
- `201` — создано
- `400` — ошибка валидации
- `404` — не найдено
- `500` — ошибка сервера

---

## Счета (Accounts)

### GET /accounts
Получить список всех счетов.

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

**Query параметры:**
- `fromDate` (ISO 8601, опционально) — дата начала (YYYY-MM-DD)
- `toDate` (ISO 8601, опционально) — дата конца (YYYY-MM-DD)
- `accountId` (число, опционально) — фильтр по счету (дебет или кредит)
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
Получить остатки по всем счетам на определённую дату.

**Query параметры:**
- `date` (ISO 8601, опционально) — дата расчета (по умолчанию текущая дата)

**Пример:**
```
GET /balances?date=2025-12-14
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
  ]
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

**Ответ:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "uptime": 3600
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
curl http://localhost:3000/api/balances?date=2025-12-14
```

### Фильтрованный список проводок
```bash
curl "http://localhost:3000/api/entries?fromDate=2025-12-01&toDate=2025-12-31&accountId=1"
```

---

## Примечания

- Все даты передаются и возвращаются в формате ISO 8601 (YYYY-MM-DD для дат, полный ISO для timestamps)
- Числовые значения (суммы) хранятся как целые числа в копейках или минимальных единицах для точности
- Удаление объектов необратимо
- История изменений проводок не ведётся (изменение перезаписывает старые значения)
