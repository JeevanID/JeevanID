import { useState } from "react";
import { ArrowLeft, Lock, Users, Building2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate, useParams } from "react-router-dom";

const adminTypes = {
  hospital: {
    title: "Hospital Admin",
    icon: Building2,
    credentials: { username: "hospital_admin", password: "hospital123" },
    description: "Manage hospital registrations and patient verifications"
  },
  doctor: {
    title: "Doctor Portal",
    icon: Heart,
    credentials: { username: "dr_admin", password: "doctor123" },
    description: "Access patient records and medical verifications"
  },
  "health-minister": {
    title: "Health Minister Dashboard",
    icon: Users,
    credentials: { username: "minister_admin", password: "minister123" },
    description: "Oversee healthcare system and policy management"
  }
};

export function AdminLogin() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const adminType = type && adminTypes[type as keyof typeof adminTypes];
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  if (!adminType) {
    return <div>Invalid admin type</div>;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = () => {
    const { username, password } = adminType.credentials;
    if (formData.username === username && formData.password === password) {
      localStorage.setItem('adminUser', JSON.stringify({ type, ...adminType }));
      navigate(`/admin/${type}/dashboard`);
    } else {
      alert("Invalid credentials. Check the demo credentials below.");
    }
  };

  const IconComponent = adminType.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/login')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
        <LanguageSwitcher />
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6 jeevan-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 jeevan-gradient rounded-full flex items-center justify-center">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{adminType.title}</h2>
              <p className="text-muted-foreground text-sm">{adminType.description}</p>
            </div>

            {/* Login Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="jeevan-input"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="jeevan-input"
                />
              </div>

              <Button 
                onClick={handleLogin}
                disabled={!formData.username || !formData.password}
                className="w-full jeevan-button-primary"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login to {adminType.title}
              </Button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
              <div className="text-xs space-y-1 font-mono">
                <div>Username: <span className="font-bold">{adminType.credentials.username}</span></div>
                <div>Password: <span className="font-bold">{adminType.credentials.password}</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}