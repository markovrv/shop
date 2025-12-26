import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Загружаем переменные окружения
dotenv.config({path: './.env'});

// Инициализируем приложение
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Обслуживание статических файлов
app.use(express.static('../client/dist'));

// Маршруты API
import accountsRouter from './routes/accounts.js';
import entriesRouter from './routes/entries.js';
import balancesRouter from './routes/balances.js';
import ownersRouter from './routes/owners.js';
import employeesRouter from './routes/employees.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';

app.use('/api/accounts', accountsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/balances', balancesRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

// Обработчик 404 для несуществующих маршрутов
app.use(notFoundHandler);

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const startServer = async () => {
  try {
    // Инициализируем базу данных
    //await initializeDatabase();
    
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, HOST, () => {
      logger.info(`Server is running on ${HOST}:${PORT}`);
      logger.info(`Database: MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'shop'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1); 
  }
};

// Обработка ошибок при запуске
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;