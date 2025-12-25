import { dbRun } from './connection.js';
import { logger } from '../utils/logger.js';

export async function initializeDatabase() {
  // Create accounts table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      type VARCHAR(50) NOT NULL,
      initialBalance DECIMAL(15,2) DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 `);

  // Create entries table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      debitAccountId INT NOT NULL,
      creditAccountId INT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      document VARCHAR(255) NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      FOREIGN KEY (debitAccountId) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (creditAccountId) REFERENCES accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Create indexes for better performance
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_entries_debitAccountId ON entries(debitAccountId);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_entries_creditAccountId ON entries(creditAccountId);`);
  } catch (e) {
    // Index might already exist, ignore error
  }

  logger.info('Database initialized successfully');
}

// Function to reset database (useful for testing)
export async function resetDatabase() {
  await dbRun('DROP TABLE IF EXISTS entries;');
  await dbRun('DROP TABLE IF EXISTS accounts;');

  logger.info('Database reset successfully');
  await initializeDatabase();
}