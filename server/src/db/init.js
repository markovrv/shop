import { getDb } from './connection.js';
import { logger } from '../utils/logger.js';

export async function initializeDatabase() {
  const db = await getDb();

  // Create accounts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      initialBalance REAL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Create entries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      debitAccountId INTEGER NOT NULL,
      creditAccountId INTEGER NOT NULL,
      amount REAL NOT NULL,
      document TEXT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (debitAccountId) REFERENCES accounts(id),
      FOREIGN KEY (creditAccountId) REFERENCES accounts(id)
    );
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_entries_debitAccountId ON entries(debitAccountId);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_entries_creditAccountId ON entries(creditAccountId);
  `);

  logger.info('Database initialized successfully');
}

// Function to reset database (useful for testing)
export async function resetDatabase() {
  const db = await getDb();

  await db.exec('DROP TABLE IF EXISTS entries;');
  await db.exec('DROP TABLE IF EXISTS accounts;');

  logger.info('Database reset successfully');
  await initializeDatabase();
}