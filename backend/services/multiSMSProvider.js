const axios = require('axios');

class MultiSMSProvider {
  constructor() {
    this.providers = {
      msg91: {
        enabled: !!process.env.MSG91_AUTH_KEY,
        authKey: process.env.MSG91_AUTH_KEY,
        templateId: process.env.MSG91_TEMPLATE_ID || '64c4157ed6fc05768153a4b3',
        senderId: 'JVNID'
      },
      textlocal: {
        enabled: !!(process.env.TEXTLOCAL_API_KEY && process.env.TEXTLOCAL_USERNAME),
        apiKey: process.env.TEXTLOCAL_API_KEY,
        username: process.env.TEXTLOCAL_USERNAME,
        sender: 'JVNID'
      },
      fast2sms: {
        enabled: !!process.env.FAST2SMS_API_KEY,
        apiKey: process.env.FAST2SMS_API_KEY,
        senderId: 'FSTSMS'
      },
      twilio: {
        enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID
      }
    };
  }

  // Send OTP via MSG91 (Popular Indian SMS service)
  async sendViaMSG91(phoneNumber, otp, purpose) {
    if (!this.providers.msg91.enabled) {
      throw new Error('MSG91 not configured');
    }

    const cleanPhone = phoneNumber.replace('+91', '').replace('+', '');
    
    const data = {
      authkey: this.providers.msg91.authKey,
      template_id: this.providers.msg91.templateId,
      mobile: cleanPhone,
      otp: otp,
      otp_expiry: 5 // 5 minutes
    };

    try {
      const response = await axios.post('https://control.msg91.com/api/v5/otp', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        provider: 'msg91',
        messageId: response.data.request_id,
        to: `+91${cleanPhone}`
      };
    } catch (error) {
      console.error('MSG91 Error:', error.response?.data || error.message);
      throw new Error(`MSG91 SMS failed: ${error.message}`);
    }
  }

  // Send OTP via TextLocal (UK-based, works globally)
  async sendViaTextLocal(phoneNumber, otp, purpose) {
    if (!this.providers.textlocal.enabled) {
      throw new Error('TextLocal not configured');
    }

    const message = `Your JeevanID OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    const data = {
      apikey: this.providers.textlocal.apiKey,
      username: this.providers.textlocal.username,
      numbers: phoneNumber,
      message: message,
      sender: this.providers.textlocal.sender
    };

    try {
      const response = await axios.post('https://api.textlocal.in/send/', 
        new URLSearchParams(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          provider: 'textlocal',
          messageId: response.data.messages[0].id,
          to: phoneNumber
        };
      } else {
        throw new Error(response.data.errors[0].message);
      }
    } catch (error) {
      console.error('TextLocal Error:', error.response?.data || error.message);
      throw new Error(`TextLocal SMS failed: ${error.message}`);
    }
  }

  // Send OTP via Fast2SMS (Indian service, no verification needed)
  async sendViaFast2SMS(phoneNumber, otp, purpose) {
    if (!this.providers.fast2sms.enabled) {
      throw new Error('Fast2SMS not configured');
    }

    const cleanPhone = phoneNumber.replace('+91', '').replace('+', '');
    const message = `Your JeevanID OTP is ${otp}. Valid for 5 minutes. Do not share.`;

    try {
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        variables_values: otp,
        route: 'otp',
        numbers: cleanPhone,
        message: message
      }, {
        headers: {
          'authorization': this.providers.fast2sms.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.return) {
        return {
          success: true,
          provider: 'fast2sms',
          messageId: response.data.request_id,
          to: `+91${cleanPhone}`
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Fast2SMS Error:', error.response?.data || error.message);
      throw new Error(`Fast2SMS failed: ${error.message}`);
    }
  }

  // Try all providers until one works
  async sendOTP(phoneNumber, otp, purpose = 'verification') {
    const errors = [];

    // Try providers in order of preference
    const providers = ['fast2sms', 'msg91', 'textlocal', 'twilio'];

    for (const providerName of providers) {
      try {
        console.log(`📱 Trying ${providerName} for ${phoneNumber}`);
        
        let result;
        switch (providerName) {
          case 'msg91':
            result = await this.sendViaMSG91(phoneNumber, otp, purpose);
            break;
          case 'textlocal':
            result = await this.sendViaTextLocal(phoneNumber, otp, purpose);
            break;
          case 'fast2sms':
            result = await this.sendViaFast2SMS(phoneNumber, otp, purpose);
            break;
          case 'twilio':
            // Use existing Twilio logic
            const twilio = require('twilio');
            const client = twilio(this.providers.twilio.accountSid, this.providers.twilio.authToken);
            const verification = await client.verify.v2
              .services(this.providers.twilio.serviceSid)
              .verifications
              .create({ to: phoneNumber, channel: 'sms' });
            result = {
              success: true,
              provider: 'twilio',
              messageId: verification.sid,
              to: phoneNumber
            };
            break;
        }

        if (result.success) {
          console.log(`✅ SMS sent successfully via ${providerName}`);
          return result;
        }
      } catch (error) {
        console.log(`❌ ${providerName} failed: ${error.message}`);
        errors.push(`${providerName}: ${error.message}`);
        continue;
      }
    }

    // If all providers fail, throw error with all attempts
    throw new Error(`All SMS providers failed:\n${errors.join('\n')}`);
  }
}

module.exports = new MultiSMSProvider();