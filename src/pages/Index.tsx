
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default Index;
