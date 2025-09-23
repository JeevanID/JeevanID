import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JeevanIDCard } from "@/components/JeevanIDCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate, useParams } from "react-router-dom";

export function PublicProfile() {
  const navigate = useNavigate();
  const { jeevanId } = useParams<{ jeevanId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching user data by JeevanID
    // In a real app, this would be an API call
    setTimeout(() => {
      if (jeevanId === "JID-2024-DEMO123") {
        setUser({
          fullName: "Demo User",
          jeevanId: "JID-2024-DEMO123",
          dateOfBirth: "1990-01-01",
          profilePhoto: null,
          isVerified: true,
          publicInfo: {
            occupation: "Software Engineer",
            education: "B.Tech Computer Science",
            skills: ["React", "TypeScript", "Node.js"],
            certifications: ["AWS Certified", "Google Cloud Professional"]
          }
        });
      } else {
        // Generate random demo user
        setUser({
          fullName: "Sample User",
          jeevanId: jeevanId || "JID-2024-SAMPLE",
          dateOfBirth: "1992-06-15",
          profilePhoto: null,
          isVerified: true,
          publicInfo: {
            occupation: "Data Analyst",
            education: "M.Sc Statistics", 
            skills: ["Python", "SQL", "Tableau"],
            certifications: ["Data Science Professional", "Tableau Certified"]
          }
        });
      }
      setLoading(false);
    }, 1000);
  }, [jeevanId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 jeevan-gradient rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        <header className="p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </header>
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">The JeevanID you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b bg-white/50 backdrop-blur-sm">
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
        <div className="max-w-4xl mx-auto">
          {/* Verification Banner */}
          <div className="mb-8">
            <Card className="p-4 jeevan-card border-success bg-success/5">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h3 className="font-semibold text-success">Verified JeevanID Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This profile has been verified by JeevanID authorities
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Digital ID Card */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Digital Identity</h2>
              <JeevanIDCard user={user} showActions={false} />
            </div>

            {/* Public Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Public Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
                    <p className="font-medium">{user.fullName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">JeevanID</h4>
                    <p className="font-mono font-medium text-primary">{user.jeevanId}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Occupation</h4>
                    <p className="font-medium">{user.publicInfo.occupation}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Education</h4>
                    <p className="font-medium">{user.publicInfo.education}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {user.publicInfo.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-6 jeevan-card">
                <h3 className="font-semibold mb-4">Certifications</h3>
                <div className="space-y-2">
                  {user.publicInfo.certifications.map((cert: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Privacy Notice */}
              <Card className="p-4 jeevan-card bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Only public information is displayed here. Sensitive personal data is protected and never shared.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}