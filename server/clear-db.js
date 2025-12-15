import { resetDatabase } from './src/db/init.js';
import { logger } from './src/utils/logger.js';

async function clearDatabase() {
  try {
    console.log('Очистка базы данных...');
    await resetDatabase();
    console.log('База данных успешно очищена');
  } catch (error) {
    console.error('Ошибка при очистке базы данных:', error);
    process.exit(1);
  }
}

clearDatabase();