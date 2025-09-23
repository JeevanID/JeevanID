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

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
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

  // Send OTP via Twilio SMS
  async sendSMSViaTwilio(phoneNumber, otp, purpose = 'verification') {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    const message = this.formatOTPMessage(otp, purpose);
    
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio'
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      throw new Error(`Failed to send SMS via Twilio: ${error.message}`);
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
    const otp = this.generateOTP();
    const expiryTime = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES * 60 * 1000));
    
    let result;
    
    try {
      if (this.demoMode) {
        result = await this.sendMockSMS(phoneNumber, otp, purpose);
      } else if (this.twilioClient) {
        result = await this.sendSMSViaTwilio(phoneNumber, otp, purpose);
      } else {
        throw new Error('No SMS provider configured');
      }

      return {
        success: true,
        otp: this.demoMode ? otp : undefined, // Only return OTP in demo mode
        hash: this.generateOTPHash(phoneNumber, otp),
        expiryTime: expiryTime,
        provider: result.provider,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('OTP Send Error:', error);
      throw error;
    }
  }

  // Verify OTP
  verifyOTP(phoneNumber, providedOTP, storedHash) {
    const generatedHash = this.generateOTPHash(phoneNumber, providedOTP);
    return generatedHash === storedHash;
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