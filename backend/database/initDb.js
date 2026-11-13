const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const targetDatabase = process.env.DB_NAME || 'skillbridge_db';

async function initDatabase() {
  console.log('====================================================');
  console.log('  SkillBridge PostgreSQL Database Initializer');
  console.log('====================================================');

  // Step 1: Connect to default postgres DB to check/create skillbridge_db
  const defaultClient = new Client({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    console.log(`[1/3] Connecting to PostgreSQL server on ${dbConfig.host}:${dbConfig.port}...`);
    await defaultClient.connect();
    console.log('      Successfully connected to PostgreSQL server.');

    // Check if skillbridge_db exists
    const checkDbRes = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDatabase]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`[2/3] Database "${targetDatabase}" does not exist. Creating it now...`);
      await defaultClient.query(`CREATE DATABASE "${targetDatabase}"`);
      console.log(`      Database "${targetDatabase}" created successfully.`);
    } else {
      console.log(`[2/3] Database "${targetDatabase}" already exists. Proceeding to schema.`);
    }
  } catch (err) {
    console.error('      ERROR connecting to PostgreSQL root server:', err.message);
    console.error('\nNOTE: Please make sure PostgreSQL service is running and credentials in .env are correct.');
    console.error('      In Windows PowerShell, you can start the service with:');
    console.error('      Start-Service -Name postgresql-x64-16');
    process.exit(1);
  } finally {
    await defaultClient.end();
  }

  // Step 2: Connect to skillbridge_db and apply schema
  const appPool = new Pool({
    ...dbConfig,
    database: targetDatabase,
  });

  try {
    console.log(`[3/3] Applying schema to "${targetDatabase}"...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await appPool.query(schemaSql);
    console.log('      All 20 tables, constraints, and indexes created successfully!');
    console.log('====================================================');
    console.log('Database initialization completed with zero errors.');
    console.log('====================================================');
  } catch (err) {
    console.error('      ERROR executing schema SQL:', err.message);
    process.exit(1);
  } finally {
    await appPool.end();
  }
}

initDatabase();

