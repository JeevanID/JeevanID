import { useState } from "react";
import { ArrowLeft, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'jeevanId'>('mobile');
  const [formData, setFormData] = useState({
    mobileNumber: "",
    jeevanId: "",
    otp: ""
  });
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = () => {
    setOtpSent(true);
    alert(`OTP sent to ${formData.mobileNumber} (Demo OTP: 123456)`);
  };

  const handleLogin = () => {
    if (formData.otp === "123456") {
      // Mock user data for demo
      const mockUser = {
        fullName: "Demo User",
        jeevanId: "JID-2024-DEMO123",
        dateOfBirth: "1990-01-01",
        mobileNumber: formData.mobileNumber || "+91 98765 43210",
        profilePhoto: null
      };
      localStorage.setItem('jeevanUser', JSON.stringify(mockUser));
      navigate('/dashboard');
    } else {
      alert("Invalid OTP. Please use 123456 for demo.");
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

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6 jeevan-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 jeevan-gradient rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your JeevanID</p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                onClick={() => setLoginMethod('mobile')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'mobile' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mobile Number
              </button>
              <button
                onClick={() => setLoginMethod('jeevanId')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'jeevanId' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                JeevanID
              </button>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              {loginMethod === 'mobile' ? (
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
              ) : (
                <div>
                  <Label htmlFor="jeevanId">JeevanID</Label>
                  <Input
                    id="jeevanId"
                    placeholder="JID-XXXX-XXXXXXX"
                    value={formData.jeevanId}
                    onChange={(e) => handleInputChange('jeevanId', e.target.value)}
                    className="jeevan-input"
                  />
                </div>
              )}

              {otpSent && (
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
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Demo OTP: <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
              )}

              {!otpSent ? (
                <Button 
                  onClick={handleSendOTP}
                  disabled={loginMethod === 'mobile' ? !formData.mobileNumber : !formData.jeevanId}
                  className="w-full jeevan-button-primary"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button 
                    onClick={handleLogin}
                    disabled={!formData.otp}
                    className="w-full jeevan-button-primary"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSendOTP}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have a JeevanID?{" "}
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Create one now
                </button>
              </p>
            </div>
          </Card>

          {/* Admin Login */}
          <Card className="mt-6 p-4 jeevan-card">
            <div className="text-center">
              <h3 className="font-medium mb-3">Admin Access</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/hospital')}
                >
                  Hospital
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/doctor')}
                >
                  Doctor
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/health-minister')}
                >
                  Health Minister
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}