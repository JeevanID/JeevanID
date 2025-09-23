import { ArrowRight, Shield, Users, Globe, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure Identity",
      description: "Your digital identity is protected with advanced security measures."
    },
    {
      icon: QrCode,
      title: "QR Code Access",
      description: "Quick access to your profile through scannable QR codes."
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Available in 22 Indian languages plus English."
    },
    {
      icon: Users,
      title: "Universal Access",
      description: "One ID for all your digital interactions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 jeevan-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-bold text-xl text-foreground">JeevanID</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="jeevan-hero-text">
            Your Digital Identity,
            <br />
            Everywhere
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get your unique JeevanID and join millions of Indians in the digital identity revolution. 
            Secure, simple, and accessible in your language.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="jeevan-button-primary px-8 py-4 text-lg font-semibold rounded-xl"
              onClick={() => navigate('/signup')}
            >
              Create My JeevanID
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg rounded-xl"
              onClick={() => navigate('/login')}
            >
              I Already Have One
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center jeevan-card hover:shadow-lg jeevan-animate">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-3xl font-bold text-primary">10M+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-secondary">22+</h3>
              <p className="text-muted-foreground">Languages Supported</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">99.9%</h3>
              <p className="text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t bg-muted/50">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 JeevanID. Powered by Digital India Initiative.</p>
        </div>
      </footer>
    </div>
  );
}