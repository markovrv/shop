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
      // Получаем обороты до startDate для корректировки начального баланса
      const debitBeforeStart = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries
         WHERE debitAccountId = ? AND date < ?`,
        [account.id, startDate]
      )
      
      const creditBeforeStart = await dbAll(
        `SELECT COALESCE(SUM(amount), 0) as total FROM entries
         WHERE creditAccountId = ? AND date < ?`,
        [account.id, startDate]
      )
      
      // Получаем обороты в периоде startDate - endDate
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
      
      const debitBefore = debitBeforeStart[0]?.total || 0
      const creditBefore = creditBeforeStart[0]?.total || 0
      const debitSum = debitResult[0]?.total || 0
      const creditSum = creditResult[0]?.total || 0
      
      // Расчет скорректированного начального баланса в зависимости от типа счета
      let adjustedInitialBalance = account.initialBalance;
      switch (account.type) {
        case 'asset': // Для активов: initialBalance = initialBalance + дебет - кредит
          adjustedInitialBalance = account.initialBalance + debitBefore - creditBefore;
          break;
        case 'liability': // Для пассивов: initialBalance = initialBalance + кредит - дебет
        case 'equity':   // Для капитала: initialBalance = initialBalance + кредит - дебет
          adjustedInitialBalance = account.initialBalance + creditBefore - debitBefore;
          break;
        case 'income': // Для доходов: initialBalance = оборот по кредиту (показывает только оборот)
          adjustedInitialBalance = creditBefore;
          break;
        case 'expense': // Для расходов: initialBalance = оборот по дебету (показывает только оборот)
          adjustedInitialBalance = debitBefore;
          break;
        default:
          adjustedInitialBalance = 0;
      }
      
      // Расчет баланса на конец периода в зависимости от типа счета
      let balance;
      switch (account.type) {
        case 'asset':
        case 'expense':
          balance = adjustedInitialBalance + debitSum - creditSum;
          break;
        case 'liability':
        case 'equity':
        case 'income':
          balance = adjustedInitialBalance + creditSum - debitSum;
          break;
        default:
          balance = 0;
      }
      
      return {
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        initialBalance: account.initialBalance,
        debitBefore, // Добавляем обороты до периода для отладки
        creditBefore, // Добавляем обороты до периода для отладки
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