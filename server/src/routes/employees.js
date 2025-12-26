import express from 'express'
import { dbRun, dbGet, dbAll } from '../db/connection.js'
import { validateRequest, createEmployeeSchema, updateEmployeeSchema } from '../middleware/validator.js'
import { logger } from '../utils/logger.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Защита всех маршрутов аутентификацией
router.use(authenticateToken);

// GET /api/employees - получить всех сотрудников
router.get('/', async (req, res, next) => {
  try {
    const employees = await dbAll('SELECT * FROM employees ORDER BY id DESC');
    res.json({
      success: true,
      data: employees
    })
  } catch (error) {
    logger.error('Ошибка получения сотрудников:', error);
    next(error)
  }
})

// GET /api/employees/:id - получить сотрудника
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const employee = await dbGet('SELECT * FROM employees WHERE id = ?',[id]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Сотрудник не найден'
      })
    }

    res.json({
      success: true,
      data: employee
    })
  } catch (error) {
    logger.error('Ошибка получения сотрудника:', error);
    next(error)
  }
})

// POST /api/employees - создать нового сотрудника
router.post('/', validateRequest(createEmployeeSchema), async (req, res, next) => {
  try {
    const { name, phone, email, daily_salary, bonus_percentage, salary_account_id, personal_account_id } = req.validated;

    await dbRun(
      'INSERT INTO employees (name, phone, email, daily_salary, bonus_percentage, salary_account_id, personal_account_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, phone || null, email || null, daily_salary || null, bonus_percentage || null, salary_account_id || null, personal_account_id || null]
    )

    // Получаем ID последней вставленной записи через отдельный запрос
    const lastIdResult = await dbGet('SELECT LAST_INSERT_ID() as id');
    const newEmployeeId = lastIdResult.id;

    const employee = await dbGet('SELECT * FROM employees WHERE id = ?', [newEmployeeId])

    logger.info(`Employee created: ${name} (ID: ${newEmployeeId})`)
    res.status(201).json({
      success: true,
      data: employee
    })
  } catch (error) {
    logger.error('Ошибка создания сотрудника:', error)
    next(error);
  }
})

// PUT /api/employees/:id - обновить сотрудника
router.put('/:id', validateRequest(updateEmployeeSchema), async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const { name, phone, email, daily_salary, bonus_percentage, salary_account_id, personal_account_id } = req.validated;

    // Проверить, существует ли сотрудник
    const existing = await dbGet('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Сотрудник не найден'
      });
    }

    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone)
    }
    if (email !== undefined) {
      updates.push('email = ?')
      values.push(email)
    }
    if (daily_salary !== undefined) {
      updates.push('daily_salary = ?')
      values.push(daily_salary)
    }
    if (bonus_percentage !== undefined) {
      updates.push('bonus_percentage = ?')
      values.push(bonus_percentage)
    }
    if (salary_account_id !== undefined) {
      updates.push('salary_account_id = ?')
      values.push(salary_account_id)
    }
    if (personal_account_id !== undefined) {
      updates.push('personal_account_id = ?')
      values.push(personal_account_id)
    }

    values.push(employeeId)

    if (updates.length > 0) {
      await dbRun(
        `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await dbGet('SELECT * FROM employees WHERE id = ?', [employeeId])
    
    logger.info(`Сотрудник обновлён: ID ${employeeId}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    logger.error('Ошибка обновления сотрудника:', error);
    next(error)
  }
})

// DELETE /api/employees/:id - удалить сотрудника
router.delete('/:id', async (req, res, next) => {
  try {
    const employeeId = req.params.id;

    // Проверить, существует ли сотрудник
    const existingEmployee = await dbGet('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Сотрудник не найден'
      });
    }

    await dbRun('DELETE FROM employees WHERE id = ?', [employeeId]);

    logger.info(`Сотрудник удалён: ID ${employeeId}`);
    res.json({
      success: true,
      message: 'Сотрудник удалён'
    });
  } catch (error) {
    logger.error('Ошибка удаления сотрудника:', error);
    next(error)
  }
})

export default router