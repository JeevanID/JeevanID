import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, User, Calendar, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";

export function Signup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    mobileNumber: "",
    otp: "",
    aadhaar: ""
  });

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Verification", icon: Phone },
    { number: 3, title: "Identity", icon: Shield }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete signup - generate JeevanID
      const jeevanId = `JID-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      localStorage.setItem('jeevanUser', JSON.stringify({
        ...formData,
        jeevanId,
        profilePhoto: null
      }));
      navigate('/dashboard');
    }
  };

  const handleSendOTP = () => {
    // Mock OTP send
    alert(`OTP sent to ${formData.mobileNumber} (Demo OTP: 123456)`);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.dateOfBirth && formData.mobileNumber;
      case 2:
        return formData.otp === "123456"; // Demo OTP
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
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-muted-foreground">
                    We've sent an OTP to {formData.mobileNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Demo: Use OTP <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value)}
                    className="jeevan-input text-center tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSendOTP}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              </div>
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
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1 jeevan-button-primary"
              >
                {currentStep === 3 ? 'Create JeevanID' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}