const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { seedDatabase } = require('./seed');

/**
 * Automatically inspects the connected database.
 * If tables do not exist, it applies schema.sql and seeds initial data.
 */
async function autoInitDatabase() {
  try {
    const checkRes = await pool.query("SELECT to_regclass('public.users') AS users_table");
    if (!checkRes.rows[0].users_table) {
      console.log('⚡ [AutoInit] No tables found in connected database. Initializing schema...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await pool.query(schemaSql);
      console.log('✅ [AutoInit] Schema created successfully! Seeding demo accounts and courses...');
      await seedDatabase();
      console.log('🚀 [AutoInit] Database initialization and seed completed!');
    } else {
      console.log('✅ [PostgreSQL] Database tables verified (users table exists).');
    }
  } catch (error) {
    console.error('⚠️ [AutoInit] Notice:', error.message);
  }
}

module.exports = { autoInitDatabase };
