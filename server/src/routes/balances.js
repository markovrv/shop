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
    
    logger.info(`Балансы подсчитаны на дату: ${date}`)
    res.json({
      success: true,
      data: balances,
      date
    })
  } catch (error) {
    logger.error('Ошибка подсчета балансов:', error)
    next(error)
 }
})

export default router