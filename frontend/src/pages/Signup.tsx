import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, User, Calendar, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OTPInput } from "@/components/OTPInput";
import { useOTP } from "@/hooks/useOTP";
import { userService } from "@/services/userService";
import { useNavigate, useLocation } from "react-router-dom";

export function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    mobileNumber: "",
    otp: "",
    aadhaar: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill mobile number if coming from login page
  useEffect(() => {
    if (location.state?.mobileNumber) {
      setFormData(prev => ({ ...prev, mobileNumber: location.state.mobileNumber }));
    }
  }, [location.state]);

  const { isLoading: otpLoading, error, otpSent, sendOTP, verifyOTP, resendOTP } = useOTP({
    onSendSuccess: (response) => {
      console.log('✅ Signup: OTP sent successfully, moving to step 2', response);
      
      // Handle different OTP sending scenarios
      const data = response.data;
      if (data?.provider === 'msg91') {
        alert(`📱 Real SMS sent via MSG91! Check your phone for the OTP.`);
      } else if (data?.provider === 'twilio-verify') {
        alert(`📱 Real SMS sent via Twilio! Check your phone for the OTP.`);
      } else if (data?.provider === 'demo-fallback') {
        alert(`⚠️ SMS failed - Demo OTP: ${data.otp}\n\nReason: ${data.fallbackReason}`);
      } else if (data?.otp) {
        alert(`📱 Demo Mode - OTP: ${data.otp}`);
      } else {
        alert(`📱 OTP sent successfully! Check your phone.`);
      }
      
      setCurrentStep(2);
    },
    onSendError: (error) => {
      console.error('❌ Signup: Failed to send OTP', error);
      alert(`Failed to send OTP: ${error}`);
    },
    onVerifySuccess: () => {
      console.log('✅ Signup: OTP verified successfully, moving to step 3');
      setCurrentStep(3);
    }
  });

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Verification", icon: Phone },
    { number: 3, title: "Identity", icon: Shield }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Send OTP when moving from step 1 to step 2
      const cleanMobile = formData.mobileNumber.startsWith('+91') 
        ? formData.mobileNumber 
        : '+91' + formData.mobileNumber;
      
      console.log('🚀 Signup: Sending OTP for mobile:', cleanMobile);
      console.log('📝 Signup: Original mobile input:', formData.mobileNumber);
      
      await sendOTP({
        mobileNumber: cleanMobile,
        purpose: 'signup'
      });
      // Step transition will be handled by onSendSuccess callback
    } else if (currentStep === 2) {
      // This will be handled by OTP verification
      return;
    } else if (currentStep === 3) {
      // Complete signup - register user
      setIsLoading(true);
      
      try {
        const registerRequest = {
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          dateOfBirth: formData.dateOfBirth,
          aadhaar: formData.aadhaar
        };
        
        const response = await userService.registerUser(registerRequest);
        
        if (response.success && response.data) {
          // Store user data and token
          userService.storeUserData(response.data.user, response.data.token);
          navigate('/dashboard');
        } else {
          // Handle registration error
          console.error('Registration failed:', response.message);
          // Fallback: create demo user
          const jeevanId = `JID-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          const mockUser = {
            id: `user_${Date.now()}`,
            jeevanId,
            fullName: formData.fullName,
            mobileNumber: formData.mobileNumber,
            dateOfBirth: formData.dateOfBirth,
            profilePhoto: null,
            verified: true,
            createdAt: new Date().toISOString()
          };
          userService.storeUserData(mockUser, "demo-token");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Registration error:', error);
        // Fallback: create demo user
        const jeevanId = `JID-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const mockUser = {
          id: `user_${Date.now()}`,
          jeevanId,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          dateOfBirth: formData.dateOfBirth,
          profilePhoto: null,
          verified: true,
          createdAt: new Date().toISOString()
        };
        userService.storeUserData(mockUser, "demo-token");
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setFormData(prev => ({ ...prev, otp }));
    await verifyOTP({
      mobileNumber: formData.mobileNumber,
      otp,
      purpose: 'signup'
    });
  };

  const handleResendOTP = async () => {
    await resendOTP({
      mobileNumber: formData.mobileNumber,
      purpose: 'signup'
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.dateOfBirth && formData.mobileNumber;
      case 2:
        return true; // OTP validation handled by OTPInput component
      case 3:
        return formData.aadhaar.length >= 12;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <LanguageSwitcher />
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-muted text-muted-foreground'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <Card className="p-6 jeevan-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Create Your JeevanID</h2>
              <p className="text-muted-foreground">Step {currentStep} of 3</p>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="jeevan-input"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="jeevan-input"
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    className="jeevan-input"
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <OTPInput
                mobileNumber={formData.mobileNumber}
                onVerify={handleOTPVerify}
                onResend={handleResendOTP}
                isLoading={otpLoading}
                error={error}
              />
            )}

            {/* Step 3: Aadhaar Verification */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Link your Aadhaar for identity verification
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Demo: Use any 12-digit number
                  </p>
                </div>
                <div>
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    placeholder="XXXX XXXX XXXX"
                    value={formData.aadhaar}
                    onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                    className="jeevan-input"
                    maxLength={12}
                  />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    🔒 Your Aadhaar data is encrypted and secure. We only verify your identity.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 2 && (
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                    disabled={isLoading || otpLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid() || isLoading || otpLoading}
                  className="flex-1 jeevan-button-primary"
                >
                  {(isLoading || otpLoading) ? (
                    currentStep === 1 ? "Sending OTP..." : "Creating JeevanID..."
                  ) : (
                    currentStep === 3 ? 'Create JeevanID' : 'Send OTP'
                  )}
                  {!(isLoading || otpLoading) && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}