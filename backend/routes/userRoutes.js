const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Mock user database (replace with actual database in production)
const users = new Map();

// Validation middleware
const validateUserRegistration = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('mobileNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid mobile number is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('aadhaar').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Valid 12-digit Aadhaar number is required')
];

const validateUserLogin = [
  body('mobileNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid mobile number is required')
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate JeevanID
const generateJeevanID = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `JID-${year}-${randomPart}`;
};

// @route   POST /api/users/register
// @desc    Register a new user (after OTP verification)
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, mobileNumber, dateOfBirth, aadhaar } = req.body;

    // Check if user already exists
    if (users.has(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'User with this mobile number already exists'
      });
    }

    // Create new user
    const jeevanId = generateJeevanID();
    const userId = `user_${Date.now()}`;
    
    const userData = {
      id: userId,
      jeevanId,
      fullName,
      mobileNumber,
      dateOfBirth,
      aadhaar: await bcrypt.hash(aadhaar, 10), // Hash Aadhaar for security
      createdAt: new Date(),
      profilePhoto: null,
      verified: true // Since they completed OTP verification
    };

    // Store user
    users.set(mobileNumber, userData);
    users.set(jeevanId, userData); // Allow lookup by JeevanID too

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userData.id,
          jeevanId: userData.jeevanId,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          dateOfBirth: userData.dateOfBirth,
          profilePhoto: userData.profilePhoto,
          verified: userData.verified,
          createdAt: userData.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('User Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/users/login
// @desc    Login user (after OTP verification)
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobileNumber, jeevanId } = req.body;
    const identifier = mobileNumber || jeevanId;

    // Find user
    const userData = users.get(identifier);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Generate token
    const token = generateToken(userData.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userData.id,
          jeevanId: userData.jeevanId,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          dateOfBirth: userData.dateOfBirth,
          profilePhoto: userData.profilePhoto,
          verified: userData.verified,
          createdAt: userData.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('User Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/profile/:identifier
// @desc    Get user profile by mobile number or JeevanID
// @access  Public (for demo, should be protected in production)
router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const userData = users.get(identifier);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: userData.id,
          jeevanId: userData.jeevanId,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          dateOfBirth: userData.dateOfBirth,
          profilePhoto: userData.profilePhoto,
          verified: userData.verified,
          createdAt: userData.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/list
// @desc    List all users (development only)
// @access  Public (development only)
router.get('/list', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  try {
    const userList = [];
    const seenIds = new Set();
    
    for (const [key, userData] of users.entries()) {
      if (!seenIds.has(userData.id)) {
        seenIds.add(userData.id);
        userList.push({
          id: userData.id,
          jeevanId: userData.jeevanId,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          verified: userData.verified,
          createdAt: userData.createdAt
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        users: userList,
        total: userList.length
      }
    });

  } catch (error) {
    console.error('List Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list users',
      error: error.message
    });
  }
});

module.exports = router;