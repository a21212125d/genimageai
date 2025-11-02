import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 md:py-28 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Account Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>
        
        <div className="space-y-6">
          {/* Account Information */}
          <Card className="p-6 glass-card border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Account Information</h2>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                <p className="text-sm font-mono mt-1 text-muted-foreground">{user.id}</p>
              </div>
            </div>
          </Card>

          {/* Support Section */}
          <Card className="p-6 glass-card border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Support</h2>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Need help or have questions? We're here to assist you!
              </p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn how to get the most out of AI Image Studio
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://docs.langdock.com/product/chat/image-generation" target="_blank" rel="noopener noreferrer">
                      View Docs
                    </a>
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Email: gen.system.ai@gmail.com
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:gen.system.ai@gmail.com">
                      Send Email
                    </a>
                  </Button>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h3 className="font-semibold mb-2">Report an Issue</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Found a bug? Let us know and we'll fix it
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:gen.system.ai@gmail.com?subject=Bug Report">
                      Report Bug
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy & Legal */}
          <Card className="p-6 glass-card border-border/50">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Legal</h2>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/privacy-policy">
                  Privacy Policy
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
