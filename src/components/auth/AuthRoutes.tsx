
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthRouteProps {
  children: JSX.Element;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);
  
  // Show loading state
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  // If user is authenticated, redirect to square-auth first
  if (user) {
    console.log("AuthRoute: User found, redirecting to /square-auth");
    return <Navigate to="/square-auth" replace />;
  }
  
  return children;
};

export default AuthRoute;
