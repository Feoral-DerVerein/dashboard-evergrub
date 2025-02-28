
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  console.log("Index page rendering, user:", user?.email);
  
  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default Index;
