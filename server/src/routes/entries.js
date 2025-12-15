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
    logger.error('Ошибка получения проводок:', error)
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
        error: 'Дебетовый и кредитный счета должны быть разными'
      })
    }
    
    // Проверяем существование счетов
    const debitAccount = await dbGet('SELECT id FROM accounts WHERE id = ?', [debitAccountId])
    const creditAccount = await dbGet('SELECT id FROM accounts WHERE id = ?', [creditAccountId])
    
    if (!debitAccount || !creditAccount) {
      return res.status(400).json({
        success: false,
        error: 'Один или оба счёта не существуют'
      })
    }
    
    const now = new Date().toISOString()
    const result = await dbRun(
      `INSERT INTO entries (date, description, debitAccountId, creditAccountId, amount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [date, description, debitAccountId, creditAccountId, amount, now, now]
    )
    
    // Получаем ID последней вставленной записи через отдельный запрос
    const lastIdResult = await dbGet('SELECT last_insert_rowid() as id');
    
    const entry = await dbGet(
      `SELECT e.*, 
              da.name as debitAccountName,
              ca.name as creditAccountName
       FROM entries e
       LEFT JOIN accounts da ON e.debitAccountId = da.id
       LEFT JOIN accounts ca ON e.creditAccountId = ca.id
       WHERE e.id = ?`,
     [lastIdResult.id]
   )
   
   logger.info(`Проводка создана: ID ${lastIdResult.id}, Amount: ${amount}`)
    res.status(201).json({
      success: true,
      data: entry
    })
  } catch (error) {
    logger.error('Ошибка создания проводки:', error)
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
        error: 'Проводка не существует'
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
    
    logger.info(`Проводка обновлена: ID ${id}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    logger.error('Ошибка обновления проводки:', error)
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
        error: 'Проводка не найдена'
      })
    }
    
    await dbRun('DELETE FROM entries WHERE id = ?', [id])
    
    logger.info(`Entry deleted: ID ${id}`)
    res.json({
      success: true,
      message: 'Проводка удалена'
    })
  } catch (error) {
    logger.error('Error deleting entry:', error)
    next(error)
 }
})

export default router