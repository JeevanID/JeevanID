import { useState, useEffect } from "react";
import { QrCode, Download, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import QRCode from "qrcode";

interface JeevanIDCardProps {
  user: {
    name: string;
    jeevanId: string;
    dateOfBirth: string;
    profilePhoto?: string;
  };
  showActions?: boolean;
}

export function JeevanIDCard({ user, showActions = true }: JeevanIDCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const profileUrl = `${window.location.origin}/profile/${user.jeevanId}`;
        const qrUrl = await QRCode.toDataURL(profileUrl, {
          width: 128,
          margin: 1,
          color: {
            dark: '#3B82F6', // Primary color
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [user.jeevanId]);

  const handleDownload = () => {
    // In a real app, this would generate and download the PDF/PNG
    alert("Download functionality would be implemented with PDF generation");
  };

  const handleShare = () => {
    // In a real app, this would share the QR code
    if (navigator.share) {
      navigator.share({
        title: "My JeevanID",
        text: `Check out my JeevanID: ${user.jeevanId}`,
        url: `${window.location.origin}/profile/${user.jeevanId}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/profile/${user.jeevanId}`);
      alert("Profile link copied to clipboard!");
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto jeevan-card">
      <div className="text-center space-y-4">
        {/* Header */}
        <div className="jeevan-gradient text-white p-3 rounded-lg">
          <h3 className="font-bold text-lg">JeevanID</h3>
          <p className="text-xs opacity-90">Digital Identity Platform</p>
        </div>

        {/* Profile Photo */}
        <div className="relative">
          {user.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-muted flex items-center justify-center border-4 border-primary">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <h4 className="font-bold text-xl text-foreground">{user.name}</h4>
          <div className="bg-muted p-2 rounded">
            <p className="text-sm text-muted-foreground">JeevanID</p>
            <p className="font-mono font-bold text-primary">{user.jeevanId}</p>
          </div>
          <p className="text-sm text-muted-foreground">DOB: {user.dateOfBirth}</p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="w-32 h-32 mx-auto rounded flex items-center justify-center">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-24 h-24 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Scan to view profile</p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleDownload}
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}