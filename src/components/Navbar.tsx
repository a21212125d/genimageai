import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Sparkles, User, Settings, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gen Ai
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/gallery")}>
            <Image className="w-4 h-4 mr-2" />
            Gallery
          </Button>

          {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuItem className="text-white">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};