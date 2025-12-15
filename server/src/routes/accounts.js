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
    
    // Получаем ID последней вставленной записи через отдельный запрос
    const lastIdResult = await dbGet('SELECT last_insert_rowid() as id');
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