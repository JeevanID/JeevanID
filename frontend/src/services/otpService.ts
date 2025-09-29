// OTP Service for handling OTP-related API calls

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
}

export interface SendOTPRequest {
  mobileNumber: string;
  purpose: 'login' | 'signup' | 'verification' | 'forgot-password';
}

export interface VerifyOTPRequest {
  mobileNumber: string;
  otp: string;
  purpose: 'login' | 'signup' | 'verification' | 'forgot-password';
}

class OTPService {
  private baseURL = 'https://jeevanid-a6lp.onrender.com/api';

  // Make HTTP request with error handling
  private async makeRequest(endpoint: string, options: RequestInit): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          data: data.data,
          errors: data.errors
        };
      }

      return data;
    } catch (error) {
      console.error('OTP Service Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: null
      };
    }
  }

  // Send OTP to mobile number
  async sendOTP(request: SendOTPRequest): Promise<OTPResponse> {
    console.log(`🚀 Sending OTP to ${request.mobileNumber} for ${request.purpose}`);
    console.log('📡 Backend URL:', `${this.baseURL}/otp/send`);
    console.log('📦 Request payload:', JSON.stringify(request));
    
    const result = await this.makeRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    
    console.log('📨 Backend response:', result);
    return result;
  }

  // Verify OTP
  async verifyOTP(request: VerifyOTPRequest): Promise<OTPResponse> {
    console.log(`🔍 Verifying OTP ${request.otp} for ${request.mobileNumber}`);
    
    return this.makeRequest('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Resend OTP
  async resendOTP(request: SendOTPRequest): Promise<OTPResponse> {
    console.log(`🔄 Resending OTP to ${request.mobileNumber} for ${request.purpose}`);
    
    return this.makeRequest('/otp/resend', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Get OTP status (development only)
  async getOTPStatus(mobileNumber: string, purpose: string): Promise<OTPResponse> {
    return this.makeRequest(`/otp/status/${encodeURIComponent(mobileNumber)}/${purpose}`, {
      method: 'GET'
    });
  }
}

export const otpService = new OTPService();