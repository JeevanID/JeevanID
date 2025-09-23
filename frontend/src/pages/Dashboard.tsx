import { useState, useEffect } from "react";
import { LogOut, Edit, Camera, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { JeevanIDCard } from "@/components/JeevanIDCard";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('jeevanUser');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jeevanUser');
    navigate('/');
  };

  const handleEditProfile = () => {
    // Mock profile edit
    const newName = prompt("Enter new name:", user?.fullName);
    if (newName && newName !== user?.fullName) {
      const updatedUser = { ...user, fullName: newName };
      setUser(updatedUser);
      localStorage.setItem('jeevanUser', JSON.stringify(updatedUser));
    }
  };

  const handlePhotoUpload = () => {
    // Mock photo upload
    alert("Photo upload functionality would be implemented with file handling");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b bg-white/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 jeevan-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="font-bold text-xl text-foreground">JeevanID</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user.fullName}!
            </h1>
            <p className="text-muted-foreground">
              Your digital identity is ready to use
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Digital ID Card */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Your Digital ID Card</h2>
              <JeevanIDCard user={user} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handlePhotoUpload}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </Card>

              {/* Profile Stats */}
              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4">Profile Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Views</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">QR Scans</span>
                    <span className="font-medium">87</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Downloads</span>
                    <span className="font-medium">23</span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile updated</span>
                    <span className="text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID card downloaded</span>
                    <span className="text-muted-foreground">1 week ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account created</span>
                    <span className="text-muted-foreground">2 weeks ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}