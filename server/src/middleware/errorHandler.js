import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({path: '../../.env'}); 

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Определение типа ошибки
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format'
    });
  }

  // Ошибки валидации (если они не были обработаны ранее)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details || {}
    });
  }

  // Ошибки базы данных
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(400).json({
      success: false,
      error: 'Database constraint error',
      details: { message: 'A database constraint was violated' }
    });
  }

  // Ошибки аутентификации (если в будущем будет добавлена)
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    });
  }

  // Ошибки авторизации (если в будущем будет добавлена)
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden access'
    });
  }

  // Ошибка "не найдено"
  if (err.status === 404 || err.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  // Ошибка сервера по умолчанию
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware для обработки 404 ошибок
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};