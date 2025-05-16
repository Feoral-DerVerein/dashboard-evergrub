
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Session closed",
        description: "You have successfully logged out",
      });
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-100"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </Button>
  );
};
