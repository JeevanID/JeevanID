import { useState, useEffect } from "react";
import { LogOut, Users, FileCheck, BarChart3, Settings, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate, useParams } from "react-router-dom";

interface AdminUser {
  type: string;
  title: string;
  icon: any;
  description: string;
}

const mockUsers = [
  { id: "JID-2024-USER001", name: "Priya Sharma", status: "verified", lastActivity: "2 hours ago", location: "Mumbai" },
  { id: "JID-2024-USER002", name: "Rajesh Kumar", status: "pending", lastActivity: "5 hours ago", location: "Delhi" },
  { id: "JID-2024-USER003", name: "Anita Patel", status: "verified", lastActivity: "1 day ago", location: "Ahmedabad" },
  { id: "JID-2024-USER004", name: "Suresh Reddy", status: "rejected", lastActivity: "3 days ago", location: "Hyderabad" },
  { id: "JID-2024-USER005", name: "Meera Singh", status: "pending", lastActivity: "4 hours ago", location: "Bangalore" },
];

const adminContent = {
  hospital: {
    stats: [
      { title: "Registered Patients", value: "2,345", icon: Users },
      { title: "Pending Verifications", value: "87", icon: FileCheck },
      { title: "Today's Registrations", value: "23", icon: BarChart3 },
      { title: "Active Beds", value: "456", icon: Settings }
    ],
    title: "Hospital Management Dashboard",
    subtitle: "Manage patient registrations and medical record verifications"
  },
  doctor: {
    stats: [
      { title: "Patients Accessed", value: "1,234", icon: Users },
      { title: "Records Verified", value: "567", icon: FileCheck },
      { title: "Today's Consultations", value: "34", icon: BarChart3 },
      { title: "Prescriptions Issued", value: "89", icon: Settings }
    ],
    title: "Doctor Portal Dashboard",
    subtitle: "Access patient records and manage medical consultations"
  },
  "health-minister": {
    stats: [
      { title: "Total Citizens", value: "10.2M", icon: Users },
      { title: "Healthcare Facilities", value: "5,678", icon: FileCheck },
      { title: "Policy Implementation", value: "94%", icon: BarChart3 },
      { title: "Digital Adoption", value: "78%", icon: Settings }
    ],
    title: "Health Minister Dashboard",
    subtitle: "Oversee healthcare system performance and policy impact"
  }
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (!userData) {
      navigate(`/admin/${type}`);
      return;
    }
    setAdminUser(JSON.parse(userData));
  }, [navigate, type]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const content = type && adminContent[type as keyof typeof adminContent];
  
  if (!adminUser || !content) {
    return <div>Loading...</div>;
  }

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b bg-white/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 jeevan-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="font-bold text-xl text-foreground">JeevanID Admin</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-foreground">{adminUser.title}</span>
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
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {content.title}
            </h1>
            <p className="text-muted-foreground">
              {content.subtitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {content.stats.map((stat, index) => (
              <Card key={index} className="p-6 jeevan-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* User Management Section */}
          <Card className="jeevan-card">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "verified" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("verified")}
                  >
                    Verified
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === "rejected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Rejected
                  </Button>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.id}</p>
                        <p className="text-xs text-muted-foreground">{user.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{user.lastActivity}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {user.status === "pending" && (
                          <>
                            <Button size="sm" variant="default">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}