const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.db = db;
    this.initializeTable();
  }

  // Initialize users table
  async initializeTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          jeevan_id VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) UNIQUE NOT NULL,
          date_of_birth DATE NOT NULL,
          aadhaar VARCHAR(12) UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          profile_picture TEXT,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_users_mobile_number ON users(mobile_number);
        CREATE INDEX IF NOT EXISTS idx_users_jeevan_id ON users(jeevan_id);
        CREATE INDEX IF NOT EXISTS idx_users_aadhaar ON users(aadhaar);
      `;
      
      await this.db.query(createTableQuery);
      console.log('✅ Users table initialized');
    } catch (error) {
      console.error('❌ Error initializing users table:', error);
    }
  }

  // Find user by mobile number
  async findByMobile(mobileNumber) {
    try {
      const query = 'SELECT * FROM users WHERE mobile_number = $1';
      const result = await this.db.query(query, [mobileNumber]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by mobile:', error);
      throw error;
    }
  }

  // Find user by JeevanID
  async findByJeevanId(jeevanId) {
    try {
      const query = 'SELECT * FROM users WHERE jeevan_id = $1';
      const result = await this.db.query(query, [jeevanId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by JeevanID:', error);
      throw error;
    }
  }

  // Find user by Aadhaar
  async findByAadhaar(aadhaar) {
    try {
      const query = 'SELECT * FROM users WHERE aadhaar = $1';
      const result = await this.db.query(query, [aadhaar]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by Aadhaar:', error);
      throw error;
    }
  }

  // Create new user
  async create(userData) {
    try {
      const {
        jeevanId,
        fullName,
        mobileNumber,
        dateOfBirth,
        aadhaar,
        isVerified = false
      } = userData;

      const query = `
        INSERT INTO users (jeevan_id, full_name, mobile_number, date_of_birth, aadhaar, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [jeevanId, fullName, mobileNumber, dateOfBirth, aadhaar, isVerified];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async update(id, updateData) {
    try {
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const values = [id, ...Object.values(updateData)];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(id) {
    try {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await this.db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Get all users (development only)
  async findAll(limit = 50) {
    try {
      const query = `
        SELECT id, jeevan_id, full_name, mobile_number, date_of_birth, 
               is_active, is_verified, profile_picture, last_login, 
               created_at, updated_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await this.db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  // Convert user to safe object (remove sensitive data)
  toSafeObject(user) {
    if (!user) return null;
    
    const { aadhaar, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = User;