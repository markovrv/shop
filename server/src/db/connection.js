import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// Connection pool for better performance with multiple connections
let pool = null;

// Default MySQL configuration
const defaultConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shop',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0, 
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Ensure numeric values are returned as numbers, not strings
  supportBigNumbers: true,
  bigNumberStrings: false, 
  decimalNumbers: true,
  // Convert dates to strings in YYYY-MM-DD format instead of JavaScript Date objects
  dateStrings: true
};

/**
 * Creates and returns a MySQL connection pool using singleton pattern
 */
async function createConnection() {
  if (pool === null) {
    try {
      pool = mysql.createPool(defaultConfig);
      console.log('MySQL connection pool established successfully');
      
      // Test the connection
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1');
      connection.release();
      console.log('MySQL connection test passed');
    } catch (error) {
      console.error('Failed to establish MySQL connection:', error.message);
      pool = null;
      throw error;
    }
  }
  
  return pool;
}

/**
 * Executes a query that doesn't return results (INSERT, UPDATE, DELETE)
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Result of the query execution
 */
async function dbRun(query, params = []) {
  const pool = await createConnection();
  try {
    const [result] = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error('Database run error:', error.message);
    throw error;
  }
}

/**
 * Executes a query that returns a single row
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row result or null
 */
async function dbGet(query, params = []) {
  const pool = await createConnection();
  try {
    const [rows] = await pool.execute(query, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database get error:', error.message);
    throw error;
  }
}

/**
 * Executes a query that returns multiple rows
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of row results
 */
async function dbAll(query, params = []) {
  const pool = await createConnection();
  try {
    const [rows] = await pool.execute(query, params);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Database all error:', error.message);
    throw error;
  }
}

/**
 * Executes a raw query with parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Result of the query execution
 */
async function dbExecute(query, params = []) {
  const pool = await createConnection();
  try {
    const result = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error.message);
    throw error;
  }
}

export {
  createConnection,
  dbRun,
  dbGet,
  dbAll,
  dbExecute
};