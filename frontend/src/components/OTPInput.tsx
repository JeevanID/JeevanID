import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPInputProps {
  mobileNumber: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  error?: string;
}

export function OTPInput({ mobileNumber, onVerify, onResend, isLoading = false, error }: OTPInputProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    setOtp("");
    onResend();
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-muted-foreground text-sm">
          We've sent a verification code to
        </p>
        <p className="font-medium">{mobileNumber}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp" className="text-center block">Enter Verification Code</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}
        
        {/* Demo hint */}
        <p className="text-xs text-muted-foreground text-center">
          Demo: Use OTP <span className="font-mono font-bold text-primary">123456</span>
        </p>
      </div>

      <Button 
        onClick={handleVerify}
        disabled={otp.length !== 6 || isLoading}
        className="w-full jeevan-button-primary"
      >
        {isLoading ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center space-y-2">
        {!canResend ? (
          <p className="text-sm text-muted-foreground">
            Resend code in {formatTime(timeLeft)}
          </p>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleResend}
            disabled={isLoading}
            className="text-sm"
          >
            Resend Code
          </Button>
        )}
      </div>
    </div>
  );
}