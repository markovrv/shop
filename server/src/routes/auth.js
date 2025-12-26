import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Получение учетных данных из переменных окружения или использование значений по умолчанию
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Хешируем пароль по умолчанию для сравнения
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // Проверяем учетные данные
    if (login === ADMIN_LOGIN && bcrypt.compareSync(password, DEFAULT_PASSWORD_HASH)) {
      // Создаем JWT токен
      const token = jwt.sign(
        { 
          login: login,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 3650) // 10 лет
        },
        JWT_SECRET
      );

      res.json({ 
        token,
        user: { login }
      });
    } else {
      res.status(401).json({ error: 'Invalid login or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

export default router;