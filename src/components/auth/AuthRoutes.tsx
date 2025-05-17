
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthRouteProps {
  children: JSX.Element;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      if (user) {
        console.log("AuthRoute: User found, redirecting to /dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);
  
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return !user ? children : null;
};

export default AuthRoute;
