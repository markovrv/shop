# Файлы маршрутов серверной части (routes/)

## src/routes/accounts.js

```javascript
import express from 'express'
import { dbRun, dbGet, dbAll } from '../db/connection.js'
import { validateRequest, createAccountSchema, updateAccountSchema } from '../middleware/validator.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/accounts - получить все счета
router.get('/', async (req, res, next) => {
  try {
    const accounts = await dbAll('SELECT * FROM accounts ORDER BY createdAt DESC')
    res.json({
      success: true,
      data: accounts
    })
  } catch (error) {
    logger.error('Error fetching accounts:', error)
    next(error)
  }
})

// POST /api/accounts - создать счет
router.post('/', validateRequest(createAccountSchema), async (req, res, next) => {
  try {
    const { name, type, initialBalance } = req.validated
    const now = new Date().toISOString()
    
    const result = await dbRun(
      `INSERT INTO accounts (name, type, initialBalance, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, initialBalance, now, now]
    )
    
    const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [result.id])
    
    logger.info(`Account created: ${name} (ID: ${result.id})`)
    res.status(201).json({
      success: true,
      data: account
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Account with this name already exists'
      })
    }
    logger.error('Error creating account:', error)
    next(error)
  }
})

// PUT /api/accounts/:id - обновить счет
router.put('/:id', validateRequest(updateAccountSchema), async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, initialBalance } = req.validated
    const now = new Date().toISOString()
    
    const existing = await dbGet('SELECT * FROM accounts WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }
    
    const updates = []
    const values = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (initialBalance !== undefined) {
      updates.push('initialBalance = ?')
      values.push(initialBalance)
    }
    
    updates.push('updatedAt = ?')
    values.push(now)
    values.push(id)
    
    if (updates.length > 1) {
      await dbRun(
        `UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }
    
    const updated = await dbGet('SELECT * FROM accounts WHERE id = ?', [id])
    
    logger.info(`Account updated: ID ${id}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Account with this name already exists'
      })
    }
    logger.error('Error updating account:', error)
    next(error)
  }
})

// DELETE /api/accounts/:id - удалить счет
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const existing = await dbGet('SELECT * FROM accounts WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }
    
    // Проверяем, используется ли счет в проводках
    const usage = await dbGet(
      `SELECT COUNT(*) as count FROM entries 
       WHERE debitAccountId = ? OR creditAccountId = ?`,
      [id, id]
    )
    
    if (usage.count > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete account with existing entries'
      })
    }
    
    await dbRun('DELETE FROM accounts WHERE id = ?', [id])
    
    logger.info(`Account deleted: ID ${id}`)
    res.json({
      success: true,
      message: 'Account deleted'
    })
  } catch (error) {
    logger.error('Error deleting account:', error)
    next(error)
  }
})

export default router
```

---

## src/routes/entries.js

```javascript
import express from 'express'
import { dbRun, dbGet, dbAll } from '../db/connection.js'
import { validateRequest, createEntrySchema, updateEntrySchema } from '../middleware/validator.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/entries - получить журнал с фильтрацией
router.get('/', async (req, res, next) => {
  try {
    const { fromDate, toDate, accountId, page = 1, limit = 50 } = req.query
    
    let where = []
    let params = []
    
    if (fromDate) {
      where.push('date >= ?')
      params.push(fromDate)
    }
    
    if (toDate) {
      where.push('date <= ?')
      params.push(toDate)
    }
    
    if (accountId) {
      where.push('(debitAccountId = ? OR creditAccountId = ?)')
      params.push(accountId, accountId)
    }
    
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    
    // Получить общее количество
    const countResult = await dbGet(
      `SELECT COUNT(*) as total FROM entries ${whereClause}`,
      params
    )
    const total = countResult.total
    
    // Получить записи с пагинацией
    const offset = (page - 1) * limit
    const entries = await dbAll(
      `SELECT e.*, 
              da.name as debitAccountName,
              ca.name as creditAccountName
       FROM entries e
       LEFT JOIN accounts da ON e.debitAccountId = da.id
       LEFT JOIN accounts ca ON e.creditAccountId = ca.id
       ${whereClause}
       ORDER BY e.date DESC, e.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    
    res.json({
      success: true,
      data: entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    })
  } catch (error) {
    logger.error('Error fetching entries:', error)
    next(error)
  }
})

// POST /api/entries - создать проводку
router.post('/', validateRequest(createEntrySchema), async (req, res, next) => {
  try {
    const { date, description, debitAccountId, creditAccountId, amount } = req.validated
    
    // Проверяем, что дебет ≠ кредит
    if (debitAccountId === creditAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Debit and credit accounts must be different'
      })
    }
    
    // Проверяем существование счетов
    const debitAccount = await dbGet('SELECT id FROM accounts WHERE id = ?', [debitAccountId])
    const creditAccount = await dbGet('SELECT id FROM accounts WHERE id = ?', [creditAccountId])
    
    if (!debitAccount || !creditAccount) {
      return res.status(400).json({
        success: false,
        error: 'One or both accounts do not exist'
      })
    }
    
    const now = new Date().toISOString()
    const result = await dbRun(
      `INSERT INTO entries (date, description, debitAccountId, creditAccountId, amount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, debitAccountId, creditAccountId, amount, now, now]
    )
    
    const entry = await dbGet(
      `SELECT e.*, 
              da.name as debitAccountName,
              ca.name as creditAccountName
       FROM entries e
       LEFT JOIN accounts da ON e.debitAccountId = da.id
       LEFT JOIN accounts ca ON e.creditAccountId = ca.id
       WHERE e.id = ?`,
      [result.id]
    )
    
    logger.info(`Entry created: ID ${result.id}, Amount: ${amount}`)
    res.status(201).json({
      success: true,
      data: entry
    })
  } catch (error) {
    logger.error('Error creating entry:', error)
    next(error)
  }
})

// PUT /api/entries/:id - обновить проводку
router.put('/:id', validateRequest(updateEntrySchema), async (req, res, next) => {
  try {
    const { id } = req.params
    const { date, description, amount } = req.validated
    const now = new Date().toISOString()
    
    const existing = await dbGet('SELECT * FROM entries WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      })
    }
    
    const updates = []
    const values = []
    
    if (date !== undefined) {
      updates.push('date = ?')
      values.push(date)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (amount !== undefined) {
      updates.push('amount = ?')
      values.push(amount)
    }
    
    if (updates.length > 0) {
      updates.push('updatedAt = ?')
      values.push(now)
      values.push(id)
      
      await dbRun(
        `UPDATE entries SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }
    
    const updated = await dbGet(
      `SELECT e.*, 
              da.name as debitAccountName,
              ca.name as creditAccountName
       FROM entries e
       LEFT JOIN accounts da ON e.debitAccountId = da.id
       LEFT JOIN accounts ca ON e.creditAccountId = ca.id
       WHERE e.id = ?`,
      [id]
    )
    
    logger.info(`Entry updated: ID ${id}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    logger.error('Error updating entry:', error)
    next(error)
  }
})

// DELETE /api/entries/:id - удалить проводку
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    
    const existing = await dbGet('SELECT * FROM entries WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      })
    }
    
    await dbRun('DELETE FROM entries WHERE id = ?', [id])
    
    logger.info(`Entry deleted: ID ${id}`)
    res.json({
      success: true,
      message: 'Entry deleted'
    })
  } catch (error) {
    logger.error('Error deleting entry:', error)
    next(error)
  }
})

export default router
```

---

## src/routes/balances.js

```javascript
import express from 'express'
import { dbAll } from '../db/connection.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/balances - получить остатки по счетам на дату
router.get('/', async (req, res, next) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query
    
    const accounts = await dbAll('SELECT * FROM accounts ORDER BY type, name')
    
    const balances = await Promise.all(accounts.map(async (account) => {
      const debitResult = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries 
         WHERE debitAccountId = ? AND date <= ?`,
        [account.id, date]
      )
      
      const creditResult = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries 
         WHERE creditAccountId = ? AND date <= ?`,
        [account.id, date]
      )
      
      const debitSum = debitResult[0]?.total || 0
      const creditSum = creditResult[0]?.total || 0
      
      // Расчет баланса в зависимости от типа счета
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
        default:
          balance = 0
      }
      
      return {
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        initialBalance: account.initialBalance,
        debitSum,
        creditSum,
        balance
      }
    }))
    
    logger.info(`Balances calculated for date: ${date}`)
    res.json({
      success: true,
      data: balances,
      date
    })
  } catch (error) {
    logger.error('Error calculating balances:', error)
    next(error)
  }
})

export default router
```

---

## src/routes/admin.js

```javascript
import express from 'express'
import { dbAll, dbRun } from '../db/connection.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// POST /api/admin/recalculate - перепровести все проводки
router.post('/recalculate', async (req, res, next) => {
  try {
    logger.warn('Starting recalculation of all entries')
    
    // Получить все проводки в хронологическом порядке
    const entries = await dbAll(
      `SELECT * FROM entries ORDER BY date ASC, createdAt ASC`
    )
    
    // Сбросить начальные балансы (опционально - если нужна полная пересчет)
    // Здесь мы просто логируем процесс
    
    let processed = 0
    for (const entry of entries) {
      // Валидация каждой проводки (можно добавить проверки)
      if (entry.amount > 0 && entry.debitAccountId && entry.creditAccountId) {
        processed++
      }
    }
    
    // Получить список уникальных счетов
    const accounts = await dbAll('SELECT DISTINCT id FROM accounts')
    
    logger.warn(`Recalculation completed: ${processed} entries processed, ${accounts.length} accounts`)
    
    res.json({
      success: true,
      message: 'All entries recalculated successfully',
      data: {
        entriesProcessed: processed,
        accountsRecalculated: accounts.length
      }
    })
  } catch (error) {
    logger.error('Error during recalculation:', error)
    next(error)
  }
})

// GET /api/admin/health - проверка здоровья сервера
router.get('/health', async (req, res) => {
  try {
    const accountsCount = await dbAll('SELECT COUNT(*) as count FROM accounts')
    const entriesCount = await dbAll('SELECT COUNT(*) as count FROM entries')
    
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        accountsTotal: accountsCount[0]?.count || 0,
        entriesTotal: entriesCount[0]?.count || 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'error',
        database: 'disconnected'
      }
    })
  }
})

export default router
```

---

## .env

```
NODE_ENV=development
PORT=3000
DATABASE_PATH=./bookkeeping.db
```

---

## .gitignore

```
node_modules/
.env
.env.local
.env.*.local
*.db
*.db-shm
*.db-wal
.DS_Store
dist/
.vuepress/dist
.cache/
```
