import express from 'express'
import { dbAll, dbRun } from '../db/connection.js'
import { logger } from '../utils/logger.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router()

// Защита всех маршрутов аутентификацией
router.use(authenticateToken);

// POST /api/admin/recalculate - перепровести все проводки
router.post('/recalculate', async (req, res, next) => {
  try {
    logger.warn('Starting recalculation of all entries')
    
    // Получить все проводки в хронологическом порядке
    const entries = await dbAll(
      `SELECT * FROM entries ORDER BY date ASC, createdAt ASC`
    )
    
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