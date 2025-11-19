import { Bell, Settings, Plug, CreditCard, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { DynamicGreeting } from '@/components/DynamicGreeting';
import ChatBot from "@/components/ChatBot";

export const BottomNav = () => {
  return null;
};

const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { notificationCount } = useNotificationsAndOrders();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative">
          {/* Header */}
          <header className="relative w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/57a9a6e0-d484-424e-b78c-34034334c2f7.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <Link to="/notifications" className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </div>
                )}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/integrations" className="flex items-center gap-2 w-full cursor-pointer">
                      <Plug className="h-4 w-4" />
                      Integrations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pricing" className="flex items-center gap-2 w-full cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Pricing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Welcome Banner */}
          <div className="px-6 mb-6 mt-6">
            <DynamicGreeting />
          </div>

          {/* AI ChatBot - Main Content */}
          <div className="mb-8">
            <ChatBot variant="inline" />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;