import { useState, useCallback } from 'react';
import { otpService, SendOTPRequest, VerifyOTPRequest, OTPResponse } from '@/services/otpService';

interface UseOTPOptions {
  onVerifySuccess?: (response: OTPResponse) => void;
  onVerifyError?: (error: string) => void;
  onSendSuccess?: (response: OTPResponse) => void;
  onSendError?: (error: string) => void;
}

export function useOTP(options: UseOTPOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = useCallback(async (request: SendOTPRequest) => {
    console.log('🎯 useOTP: Starting sendOTP process', request);
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 useOTP: Calling otpService.sendOTP');
      const response = await otpService.sendOTP(request);
      console.log('✅ useOTP: Got response from otpService', response);
      
      if (response.success) {
        setOtpSent(true);
        console.log('🎉 useOTP: OTP sent successfully, calling onSendSuccess');
        options.onSendSuccess?.(response);
      } else {
        console.log('❌ useOTP: OTP send failed', response.message);
        setError(response.message);
        options.onSendError?.(response.message);
      }
    } catch (err) {
      console.error('💥 useOTP: Exception in sendOTP', err);
      const errorMessage = 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      options.onSendError?.(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🏁 useOTP: sendOTP process completed');
    }
  }, [options]);

  const verifyOTP = useCallback(async (request: VerifyOTPRequest) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await otpService.verifyOTP(request);
      
      if (response.success) {
        options.onVerifySuccess?.(response);
      } else {
        setError(response.message);
        options.onVerifyError?.(response.message);
      }
    } catch (err) {
      const errorMessage = 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      options.onVerifyError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const resendOTP = useCallback(async (request: SendOTPRequest) => {
    setError('');
    await sendOTP(request);
  }, [sendOTP]);

  const resetOTP = useCallback(() => {
    setOtpSent(false);
    setError('');
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    otpSent,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTP,
    setError
  };
}