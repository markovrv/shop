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
    await dbRun(`CREATE INDEX idx_entries_date ON entries(date);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_entries_debitAccountId ON entries(debitAccountId);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_entries_creditAccountId ON entries(creditAccountId);`);
  } catch (e) {
    // Index might already exist, ignore error
  }

  // Create owners table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS owners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(25) NULL,
      phone VARCHAR(255) NULL,
      notes TEXT NULL,
      personal_account_id INT,
      revenue_account_id INT,
      cash_account_id INT,
      bank_account_id INT,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      FOREIGN KEY (personal_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (revenue_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (cash_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (bank_account_id) REFERENCES accounts(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Create indexes for the owners table
  try {
    await dbRun(`CREATE INDEX idx_owners_name ON owners(name);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_owners_personal_account_id ON owners(personal_account_id);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_owners_revenue_account_id ON owners(revenue_account_id);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_owners_cash_account_id ON owners(cash_account_id);`);
  } catch (e) {
    // Index might already exist, ignore error
  }
  try {
    await dbRun(`CREATE INDEX idx_owners_bank_account_id ON owners(bank_account_id);`);
  } catch (e) {
    // Index might already exist, ignore error
  }

  // Add constraint to ensure name is not empty
  try {
    await dbRun(`ALTER TABLE owners ADD CONSTRAINT chk_owners_name_not_empty CHECK (name != '');`);
  } catch (e) {
    // Constraint might already exist or not be supported by the MySQL version, ignore error
  }

  logger.info('Database initialized successfully');
}