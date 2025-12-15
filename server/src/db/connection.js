import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logger } from '../utils/logger.js';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DATABASE_PATH || './bookkeeping.db';
  
  try {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON');
    
    logger.info(`Connected to SQLite database at ${dbPath}`);
    return dbInstance;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

// Convenience functions for common operations
export async function dbRun(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}

export async function dbGet(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

export async function dbAll(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

export async function dbExecute(sql, params = []) {
  const db = await getDb();
  return db.execute(sql, params);
}