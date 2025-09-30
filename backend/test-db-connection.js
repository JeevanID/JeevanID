const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL database...');
    console.log('URI:', process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in log
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    const client = await pool.connect();
    
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('� Users table exists:', tableCheck.rows[0].exists);
    
    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📁 Available tables:', tables.rows.map(row => row.table_name));
    
    client.release();
    await pool.end();
    console.log('👋 Disconnected from PostgreSQL database');
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();