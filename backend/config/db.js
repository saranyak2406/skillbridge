const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'skillbridge_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // maximum connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute a query with parameterized inputs
 * @param {string} text - SQL Query text
 * @param {Array} params - Parameter values
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Acquire a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

/**
 * Test PostgreSQL connectivity
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name');
    console.log(`[PostgreSQL] Connected successfully to database "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[PostgreSQL] Connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};

