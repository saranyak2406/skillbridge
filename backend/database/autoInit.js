const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { seedDatabase } = require('./seed');

/**
 * Automatically inspects the connected database.
 * If tables do not exist, it applies schema.sql and seeds initial data.
 * If users table exists (e.g. created manually), it ensures required columns and remaining tables exist.
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
      console.log('✅ [PostgreSQL] Verifying schema and ensuring required columns and tables exist...');
      // Ensure users table has full_name, profile_image, is_active, updated_at
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
            UPDATE users SET full_name = name WHERE full_name IS NULL;
          END IF;
        END $$;
      `);

      // Ensure all 20 tables exist
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await pool.query(schemaSql);
      console.log('✅ [PostgreSQL] Database tables verified and aligned.');
    }
  } catch (error) {
    console.error('⚠️ [AutoInit] Notice:', error.message);
  }
}

module.exports = { autoInitDatabase };
