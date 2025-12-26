import express from 'express'
import { dbRun, dbGet, dbAll } from '../db/connection.js'
import { validateRequest, createOwnerSchema, updateOwnerSchema } from '../middleware/validator.js'
import { logger } from '../utils/logger.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Защита всех маршрутов аутентификацией
router.use(authenticateToken);

// GET /api/owners - получить всех владельцев
router.get('/', async (req, res, next) => {
  try {
    const owners = await dbAll('SELECT * FROM owners ORDER BY id DESC');
    res.json({
      success: true,
      data: owners
    })
  } catch (error) {
    logger.error('Ошибка получения владельцев:', error);
    next(error)
  }
})

// GET /api/owners/:id - получить владельца
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const owner = await dbGet('SELECT * FROM owners WHERE id = ?',[id]);

    if (!owner) {
      return res.status(404).json({
        success: false,
        error: 'Владелец не найден'
      })
    }

    res.json({
      success: true,
      data: owner
    })
  } catch (error) {
    logger.error('Ошибка получения владельца:', error);
    next(error)
  }
})

// POST /api/owners - создать нового владельца
router.post('/', validateRequest(createOwnerSchema), async (req, res, next) => {
  try {
    const { name, email, phone, notes, personal_account_id, revenue_account_id, cash_account_id, bank_account_id } = req.validated;

    await dbRun(
      'INSERT INTO owners (name, email, phone, notes, personal_account_id, revenue_account_id, cash_account_id, bank_account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email || null, phone || null, notes || null, personal_account_id || null, revenue_account_id || null, cash_account_id || null, bank_account_id || null]
    )

    // Получаем ID последней вставленной записи через отдельный запрос
    const lastIdResult = await dbGet('SELECT LAST_INSERT_ID() as id');
    const newOwnerId = lastIdResult.id;

    const owner = await dbGet('SELECT * FROM owners WHERE id = ?', [newOwnerId])

    logger.info(`Owner created: ${name} (ID: ${newOwnerId})`)
    res.status(201).json({
      success: true,
      data: owner
    })
  } catch (error) {
    logger.error('Ошибка создания владельца:', error)
    next(error);
  }
})

// PUT /api/owners/:id - обновить владельца
router.put('/:id', validateRequest(updateOwnerSchema), async (req, res, next) => {
  try {
    const ownerId = req.params.id;
    const { name, email, phone, notes, personal_account_id, revenue_account_id, cash_account_id, bank_account_id } = req.validated;

    // Проверить, существует ли владелец
    const existing = await dbGet('SELECT * FROM owners WHERE id = ?', [ownerId]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Владелец не найден'
      });
    }

    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (email !== undefined) {
      updates.push('email = ?')
      values.push(email)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone)
    }

    if (notes !== undefined) {
      updates.push('notes = ?')
      values.push(notes)
    }

    if (personal_account_id !== undefined) {
      updates.push('personal_account_id = ?')
      values.push(personal_account_id)
    }
    if (revenue_account_id !== undefined) {
      updates.push('revenue_account_id = ?')
      values.push(revenue_account_id)
    }
    if (cash_account_id !== undefined) {
      updates.push('cash_account_id = ?')
      values.push(cash_account_id)
    }

    if (bank_account_id !== undefined) {
      updates.push('bank_account_id = ?')
      values.push(bank_account_id)
    }

    values.push(ownerId)

    if (updates.length > 0) {
      await dbRun(
        `UPDATE owners SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await dbGet('SELECT * FROM owners WHERE id = ?', [ownerId])
    
    logger.info(`Владелец обнолвлён: ID ${ownerId}`)
    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    logger.error('Ошибка обновления владельца:', error);
    next(error)
  }
})

// DELETE /api/owners/:id - удалить владельца
router.delete('/:id', async (req, res, next) => {
  try {
    const ownerId = req.params.id;

    // Проверить, существует ли владелец
    const existingOwner = await dbGet('SELECT id FROM owners WHERE id = ?', [ownerId]);
    if (!existingOwner) {
      return res.status(404).json({
        success: false,
        error: 'Владелец не найден'
      });
    }

    await dbRun('DELETE FROM owners WHERE id = ?', [ownerId]);

    logger.info(`Владелец удалён: ID ${ownerId}`);
    res.json({
      success: true,
      message: 'Владелец удалён'
    });
  } catch (error) {
    logger.error('Ошибка удаления владельца:', error);
    next(error)
  }
})

export default router