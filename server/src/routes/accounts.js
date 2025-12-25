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
    logger.error('Ошибка получения счетов:', error)
    next(error)
  }
})

// POST /api/accounts - создать счет
router.post('/', validateRequest(createAccountSchema), async (req, res, next) => {
  try {
    const { name, type, initialBalance } = req.validated
    const now = new Date().toISOString().replace('T', ' ').replace('Z', '')
    
    const result = await dbRun(
      `INSERT INTO accounts (name, type, initialBalance, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, initialBalance, now, now]
    )
    
    // Получаем ID последней вставленной записи через отдельный запрос
    const lastIdResult = await dbGet('SELECT LAST_INSERT_ID() as id');
    const newAccountId = lastIdResult.id;
    
    const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [newAccountId])
    
    logger.info(`Account created: ${name} (ID: ${newAccountId})`)
    res.status(201).json({
      success: true,
      data: account
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Счёт с таким названием уже существует'
      })
    }
    logger.error('Ошибка создания счёта:', error)
    next(error)
  }
})

// PUT /api/accounts/:id - обновить счет
router.put('/:id', validateRequest(updateAccountSchema), async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, type, initialBalance } = req.validated
    const now = new Date().toISOString().replace('T', ' ').replace('Z', '')
    
    const existing = await dbGet('SELECT * FROM accounts WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Счёт не найден'
      })
    }
    
    const updates = []
    const values = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (type !== undefined) {
      updates.push('type = ?')
      values.push(type)
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
    
    logger.info(`Счёт обнолвлён: ID ${id}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Счёт с таким названием уде существует'
      })
    }
    logger.error('Ошибка обновления счёта:', error)
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
        error: 'Счёт не найден'
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
        error: 'Нельзя удалять счёт, у которого есть проводки.'
      })
    }
    
    await dbRun('DELETE FROM accounts WHERE id = ?', [id])
    
    logger.info(`Account deleted: ID ${id}`)
    res.json({
      success: true,
      message: 'Счёт удалён'
    })
  } catch (error) {
    logger.error('Ошибка удаления счёта:', error)
    next(error)
  }
})

export default router