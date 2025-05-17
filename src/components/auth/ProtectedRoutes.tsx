
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      if (!user && location.pathname !== '/') {
        console.log("ProtectedRoute: No user, redirecting to /");
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);
  
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return user ? children : null;
};

export default ProtectedRoute;
