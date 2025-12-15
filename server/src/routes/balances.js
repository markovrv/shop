import express from 'express'
import { dbAll } from '../db/connection.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/balances - получить остатки по счетам за период
router.get('/', async (req, res, next) => {
  try {
    // Если не указана дата начала, используем 2000-01-01
    // Если не указана дата окончания, используем текущую дату
    const { startDate = '2000-01-01', endDate = new Date().toISOString().split('T')[0] } = req.query
    
    const accounts = await dbAll('SELECT * FROM accounts ORDER BY type, name')
    
    const balances = await Promise.all(accounts.map(async (account) => {
      const debitResult = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries
         WHERE debitAccountId = ? AND date >= ? AND date <= ?`,
        [account.id, startDate, endDate]
      )
      
      const creditResult = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries
         WHERE creditAccountId = ? AND date >= ? AND date <= ?`,
        [account.id, startDate, endDate]
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
    
    logger.info(`Балансы подсчитаны за период с ${startDate} по ${endDate}`)
    res.json({
      success: true,
      data: balances,
      startDate,
      endDate
    })
  } catch (error) {
    logger.error('Ошибка подсчета балансов:', error)
    next(error)
 }
})

export default router