const express = require('express');
const { body, validationResult } = require('express-validator');
const otpService = require('../services/otpService');
const storageService = require('../services/storageService');

const router = express.Router();

// Validation middleware
const validatePhoneNumber = body('mobileNumber')
  .matches(/^\+?[1-9]\d{1,14}$/)
  .withMessage('Please provide a valid mobile number');

const validateOTP = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

const validatePurpose = body('purpose')
  .isIn(['login', 'signup', 'verification', 'forgot-password'])
  .withMessage('Invalid purpose');

// Rate limiting middleware for OTP requests
const checkRateLimit = async (req, res, next) => {
  const { mobileNumber, purpose } = req.body;
  
  try {
    const rateLimit = await storageService.getRateLimit(mobileNumber, purpose);
    
    if (rateLimit.exceeded) {
      return res.status(429).json({
        success: false,
        message: `Too many OTP requests. Please try again later.`,
        data: {
          maxRequests: rateLimit.maxRequests,
          windowMinutes: Math.floor(process.env.RATE_LIMIT_WINDOW_MS / 60000)
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit check error:', error);
    next(); // Continue on error
  }
};

// @route   POST /api/otp/send
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send', [
  validatePhoneNumber,
  validatePurpose,
  checkRateLimit
], async (req, res) => {
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

    const { mobileNumber, purpose } = req.body;

    // Update rate limit
    await storageService.storeRateLimit(mobileNumber, purpose);

    // Send OTP
    const otpResult = await otpService.sendOTP(mobileNumber, purpose);
    
    // Response (don't include actual OTP in production)
    const response = {
      success: true,
      message: `OTP sent successfully to ${mobileNumber}`,
      data: {
        expiryMinutes: process.env.OTP_EXPIRY_MINUTES,
        provider: otpResult.provider,
        messageId: otpResult.messageId,
        to: otpResult.to
      }
    };

    // Include OTP in demo mode for testing
    if (process.env.DEMO_MODE === 'true') {
      response.data.otp = otpResult.otp;
      response.data.demoMode = true;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post('/verify', [
  validatePhoneNumber,
  validateOTP,
  validatePurpose
], async (req, res) => {
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

    const { mobileNumber, otp, purpose } = req.body;

    // Verify OTP using the service
    const verificationResult = await otpService.verifyOTPCode(mobileNumber, otp, purpose);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Invalid OTP. Please try again.',
        error: verificationResult.error,
        data: verificationResult.remainingAttempts ? {
          remainingAttempts: verificationResult.remainingAttempts
        } : null
      });
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        verified: true,
        mobileNumber: verificationResult.phoneNumber,
        purpose,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/otp/resend
// @desc    Resend OTP
// @access  Public
router.post('/resend', [
  validatePhoneNumber,
  validatePurpose,
  checkRateLimit
], async (req, res) => {
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

    const { mobileNumber, purpose } = req.body;

    // Send new OTP
    const otpResult = await otpService.sendOTP(mobileNumber, purpose);

    // Response
    const response = {
      success: true,
      message: `New OTP sent successfully to ${mobileNumber}`,
      data: {
        expiryMinutes: process.env.OTP_EXPIRY_MINUTES,
        provider: otpResult.provider,
        messageId: otpResult.messageId,
        to: otpResult.to
      }
    };

    // Include OTP in demo mode for testing
    if (process.env.DEMO_MODE === 'true') {
      response.data.otp = otpResult.otp;
      response.data.demoMode = true;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/otp/status/:mobileNumber/:purpose
// @desc    Get OTP status for debugging (development only)
// @access  Public (development only)
router.get('/status/:mobileNumber/:purpose', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  try {
    const { mobileNumber, purpose } = req.params;
    
    const otpData = await storageService.getOTP(mobileNumber, purpose);
    const rateLimit = await storageService.getRateLimit(mobileNumber, purpose);
    
    res.status(200).json({
      success: true,
      data: {
        otpExists: !!otpData,
        otpData: otpData ? {
          attempts: otpData.attempts,
          expiryTime: otpData.expiryTime,
          createdAt: otpData.createdAt
        } : null,
        rateLimit,
        config: {
          demoMode: process.env.DEMO_MODE === 'true',
          demoOTP: process.env.DEMO_MODE === 'true' ? process.env.DEMO_OTP : undefined,
          expiryMinutes: process.env.OTP_EXPIRY_MINUTES,
          maxAttempts: process.env.MAX_OTP_ATTEMPTS
        }
      }
    });
  } catch (error) {
    console.error('Get OTP Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
      error: error.message
    });
  }
});

module.exports = router;