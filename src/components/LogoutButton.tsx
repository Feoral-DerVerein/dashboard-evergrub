
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
      console.log("Logging out...");
      await signOut();
      
      toast({
        title: "Session closed",
        description: "You have successfully logged out",
      });
      
      console.log("Redirecting to login page");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Cerrar sesión</span>
    </Button>
  );
};
