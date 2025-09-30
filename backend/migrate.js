const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationRunner {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });
  }

  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await this.pool.query(query);
      console.log('✅ Migrations table created/verified');
    } catch (error) {
      console.error('❌ Error creating migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await this.pool.query('SELECT filename FROM migrations ORDER BY id');
      return result.rows.map(row => row.filename);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      return [];
    }
  }

  async executeMigration(filename, sql) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the migration SQL
      await client.query(sql);
      
      // Record the migration as executed
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Executed migration: ${filename}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Error executing migration ${filename}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations() {
    try {
      console.log('🔄 Starting database migrations...');
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get list of executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      console.log('📋 Previously executed migrations:', executedMigrations);
      
      // Get all migration files
      const migrationsDir = path.join(__dirname, 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log('📁 Found migration files:', migrationFiles);
      
      // Execute pending migrations
      let executedCount = 0;
      for (const filename of migrationFiles) {
        if (!executedMigrations.includes(filename)) {
          const filepath = path.join(migrationsDir, filename);
          const sql = fs.readFileSync(filepath, 'utf8');
          
          console.log(`🔄 Executing migration: ${filename}`);
          await this.executeMigration(filename, sql);
          executedCount++;
        } else {
          console.log(`⏭️  Skipping already executed migration: ${filename}`);
        }
      }
      
      if (executedCount === 0) {
        console.log('✅ No new migrations to execute. Database is up to date.');
      } else {
        console.log(`✅ Successfully executed ${executedCount} migration(s).`);
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  async rollback(migrationFilename) {
    // This is a simple rollback - in production you'd want proper down migrations
    try {
      console.log(`🔄 Rolling back migration: ${migrationFilename}`);
      
      const result = await this.pool.query(
        'DELETE FROM migrations WHERE filename = $1 RETURNING *',
        [migrationFilename]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Rolled back migration: ${migrationFilename}`);
        console.log('⚠️  Note: This only removes the migration record. You may need to manually undo database changes.');
      } else {
        console.log(`⚠️  Migration ${migrationFilename} was not found in executed migrations.`);
      }
      
    } catch (error) {
      console.error('❌ Rollback failed:', error);
    } finally {
      await this.pool.end();
    }
  }

  async status() {
    try {
      console.log('📊 Migration Status:');
      
      await this.createMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      
      const migrationsDir = path.join(__dirname, 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log('\n📁 Available Migrations:');
      migrationFiles.forEach(filename => {
        const status = executedMigrations.includes(filename) ? '✅ Executed' : '⏳ Pending';
        console.log(`  ${filename} - ${status}`);
      });
      
      console.log(`\n📈 Total: ${migrationFiles.length} migrations, ${executedMigrations.length} executed, ${migrationFiles.length - executedMigrations.length} pending`);
      
    } catch (error) {
      console.error('❌ Error checking migration status:', error);
    } finally {
      await this.pool.end();
    }
  }
}

// CLI interface
const command = process.argv[2];
const migrationRunner = new MigrationRunner();

switch (command) {
  case 'up':
  case 'migrate':
    migrationRunner.runMigrations();
    break;
    
  case 'rollback':
    const filename = process.argv[3];
    if (!filename) {
      console.error('❌ Please provide migration filename to rollback');
      process.exit(1);
    }
    migrationRunner.rollback(filename);
    break;
    
  case 'status':
    migrationRunner.status();
    break;
    
  default:
    console.log(`
🗄️  JeevanID Database Migration Tool

Usage:
  node migrate.js migrate    - Run all pending migrations
  node migrate.js up         - Run all pending migrations (alias)
  node migrate.js status     - Show migration status
  node migrate.js rollback <filename> - Rollback a specific migration

Examples:
  node migrate.js migrate
  node migrate.js status
  node migrate.js rollback 001_create_users_table.sql
    `);
    break;
}

module.exports = MigrationRunner;