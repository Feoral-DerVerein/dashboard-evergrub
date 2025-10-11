
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  // If no user, redirect to home
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /");
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
