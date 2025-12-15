import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Загружаем переменные окружения
dotenv.config();

// Инициализируем приложение
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
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
import adminRouter from './routes/admin.js';

app.use('/api/accounts', accountsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/balances', balancesRouter);
app.use('/api/admin', adminRouter);

// Корневой маршрут
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Bookkeeping API Server',
//     version: '1.0.0',
//     endpoints: {
//       accounts: '/api/accounts',
//       entries: '/api/entries',
//       balances: '/api/balances',
//       recalculate: '/api/admin/recalculate',
//       health: 'POST /api/admin/health',
//     }
//   });
// });

// Обработчик 404 для несуществующих маршрутов
app.use(notFoundHandler);

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const startServer = async () => {
  try {
    // Инициализируем базу данных
    await initializeDatabase();
    
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, HOST, () => {
      logger.info(`Server is running on ${HOST}:${PORT}`);
      logger.info(`Database path: ${process.env.DATABASE_PATH || './bookkeeping.db'}`);
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