const twilio = require('twilio');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class OTPService {
  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // OTP storage for demo mode
    this.otpStorage = new Map();

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.demoMode = process.env.DEMO_MODE === 'true';
    this.demoOTP = process.env.DEMO_OTP || '123456';
  }

  // Generate a random OTP
  generateOTP(length = 6) {
    if (this.demoMode) {
      return this.demoOTP;
    }
    
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  // Generate OTP hash for storage
  generateOTPHash(phoneNumber, otp) {
    return crypto
      .createHash('sha256')
      .update(`${phoneNumber}:${otp}:${process.env.JWT_SECRET}`)
      .digest('hex');
  }

  // Send OTP via Twilio Verify Service
  async sendSMSViaTwilio(phoneNumber, purpose = 'verification') {
    if (!this.twilioClient || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new Error('Twilio Verify service not configured');
    }

    try {
      const cleanPhone = this.cleanMobileNumber(phoneNumber);
      
      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
          to: cleanPhone,
          channel: 'sms'
        });
      
      console.log(`📱 OTP sent via Twilio Verify to ${cleanPhone}, SID: ${verification.sid}`);
      
      return {
        success: true,
        messageId: verification.sid,
        provider: 'twilio-verify',
        status: verification.status,
        to: verification.to
      };
    } catch (error) {
      console.error('Twilio Verify Error:', error);
      throw new Error(`Failed to send OTP via Twilio Verify: ${error.message}`);
    }
  }

  // Verify OTP via Twilio Verify Service
  async verifyOTPViaTwilio(phoneNumber, code) {
    if (!this.twilioClient || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new Error('Twilio Verify service not configured');
    }

    try {
      const cleanPhone = this.cleanMobileNumber(phoneNumber);
      
      const verificationCheck = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({
          to: cleanPhone,
          code: code
        });
      
      console.log(`✅ OTP verification result for ${cleanPhone}: ${verificationCheck.status}`);
      
      return {
        success: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        sid: verificationCheck.sid
      };
    } catch (error) {
      console.error('Twilio Verify Check Error:', error);
      throw new Error(`Failed to verify OTP via Twilio: ${error.message}`);
    }
  }

  // Send OTP via Email (fallback option)
  async sendOTPViaEmail(email, otp, purpose = 'verification') {
    const subject = `JeevanID - Your OTP for ${purpose}`;
    const html = this.formatOTPEmailHTML(otp, purpose);

    try {
      const result = await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: html
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: 'email'
      };
    } catch (error) {
      console.error('Email OTP Error:', error);
      throw new Error(`Failed to send OTP via email: ${error.message}`);
    }
  }

  // Mock SMS service for development
  async sendMockSMS(phoneNumber, otp, purpose = 'verification') {
    console.log(`📱 [MOCK SMS] Sending OTP to ${phoneNumber}`);
    console.log(`📱 [MOCK SMS] OTP: ${otp}`);
    console.log(`📱 [MOCK SMS] Purpose: ${purpose}`);
    console.log(`📱 [MOCK SMS] Message: ${this.formatOTPMessage(otp, purpose)}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      provider: 'mock'
    };
  }

  // Main method to send OTP
  async sendOTP(phoneNumber, purpose = 'verification') {
    const cleanPhone = this.cleanMobileNumber(phoneNumber);
    const expiryTime = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES * 60 * 1000));
    
    let result;
    
    try {
      if (this.demoMode) {
        const otp = this.generateOTP();
        this.storeOTPForDemo(cleanPhone, otp, purpose);
        result = await this.sendMockSMS(cleanPhone, otp, purpose);
        
        return {
          success: true,
          otp: otp, // Return OTP in demo mode
          expiryTime: expiryTime,
          provider: result.provider,
          messageId: result.messageId,
          to: cleanPhone
        };
      } else if (this.twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
        result = await this.sendSMSViaTwilio(cleanPhone, purpose);
        
        return {
          success: true,
          expiryTime: expiryTime,
          provider: result.provider,
          messageId: result.messageId,
          status: result.status,
          to: result.to
        };
      } else {
        throw new Error('No SMS provider configured');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      throw error;
    }
  }

  // Main method to verify OTP
  async verifyOTPCode(phoneNumber, code, purpose = 'verification') {
    const cleanPhone = this.cleanMobileNumber(phoneNumber);
    
    try {
      if (this.demoMode) {
        return this.verifyDemoOTP(cleanPhone, code);
      } else if (this.twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
        const result = await this.verifyOTPViaTwilio(cleanPhone, code);
        return {
          success: result.success,
          verified: result.success,
          status: result.status,
          phoneNumber: cleanPhone,
          purpose: purpose
        };
      } else {
        throw new Error('No verification service configured');
      }
    } catch (error) {
      console.error('OTP Verify Error:', error);
      throw error;
    }
  }

  // Store OTP for demo mode
  storeOTPForDemo(phoneNumber, otp, purpose) {
    this.otpStorage.set(phoneNumber, {
      otp,
      purpose,
      expiry: Date.now() + (process.env.OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
      createdAt: new Date()
    });
  }

  // Verify OTP in demo mode
  verifyDemoOTP(phoneNumber, providedOTP) {
    const storedData = this.otpStorage.get(phoneNumber);
    
    if (!storedData) {
      return {
        success: false,
        verified: false,
        message: 'OTP not found or expired',
        error: 'OTP_NOT_FOUND'
      };
    }

    if (Date.now() > storedData.expiry) {
      this.otpStorage.delete(phoneNumber);
      return {
        success: false,
        verified: false,
        message: 'OTP has expired',
        error: 'OTP_EXPIRED'
      };
    }

    if (storedData.attempts >= 3) {
      this.otpStorage.delete(phoneNumber);
      return {
        success: false,
        verified: false,
        message: 'Maximum verification attempts exceeded',
        error: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    if (storedData.otp !== providedOTP) {
      storedData.attempts++;
      return {
        success: false,
        verified: false,
        message: 'Invalid OTP',
        error: 'INVALID_OTP',
        remainingAttempts: 3 - storedData.attempts
      };
    }

    // OTP verified successfully
    this.otpStorage.delete(phoneNumber);
    return {
      success: true,
      verified: true,
      message: 'OTP verified successfully',
      phoneNumber: phoneNumber
    };
  }

  // Clean mobile number format
  cleanMobileNumber(mobileNumber) {
    // Remove spaces, dashes, and parentheses
    let cleaned = mobileNumber.replace(/[\s\-\(\)]/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }

  // Format OTP message for SMS
  formatOTPMessage(otp, purpose) {
    const purposeMap = {
      'login': 'sign in to',
      'signup': 'create your account on',
      'verification': 'verify your identity on',
      'forgot-password': 'reset your password on'
    };
    
    const action = purposeMap[purpose] || 'verify your identity on';
    
    return `Your JeevanID OTP is: ${otp}\n\nUse this code to ${action} JeevanID. This code will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.\n\nDo not share this code with anyone.`;
  }

  // Format OTP email HTML
  formatOTPEmailHTML(otp, purpose) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JeevanID OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { background: #667eea; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 3px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆔 JeevanID</h1>
            <p>Your Digital Identity Verification</p>
          </div>
          <div class="content">
            <h2>OTP Verification Code</h2>
            <p>Hello,</p>
            <p>Your OTP for ${purpose} is:</p>
            <div class="otp-code">${otp}</div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes</li>
              <li>Do not share this code with anyone</li>
              <li>JeevanID will never ask for your OTP over phone or email</li>
            </ul>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 JeevanID. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new OTPService();