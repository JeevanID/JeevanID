const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test PostgreSQL connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    console.log('⚠️  Server will continue running without PostgreSQL. User data will be stored in memory only.');
    // Don't exit the process, continue running for OTP functionality
  });

// Make pool available to routes
app.locals.db = pool;

// Import routes
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-otp.html');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'JeevanID Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 JeevanID Backend server is running on port ${PORT}`);
  console.log(`📱 OTP Service is ready`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});