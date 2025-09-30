-- Migration: 001_create_users_table.sql
-- Description: Create users table with all necessary fields and indexes
-- Created: 2025-09-30

-- Create users table
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
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns
COMMENT ON TABLE users IS 'JeevanID users table storing user information';
COMMENT ON COLUMN users.jeevan_id IS 'Unique JeevanID identifier for the user';
COMMENT ON COLUMN users.mobile_number IS 'User mobile number (with country code)';
COMMENT ON COLUMN users.aadhaar IS 'User Aadhaar number (12 digits)';
COMMENT ON COLUMN users.is_verified IS 'Whether the user has completed OTP verification';