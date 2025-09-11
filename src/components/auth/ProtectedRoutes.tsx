
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading && !onboardingLoading) {
      setIsChecking(false);
      
      if (!user && location.pathname !== '/') {
        console.log("ProtectedRoute: No user, redirecting to /");
        navigate("/", { replace: true });
        return;
      }
      
      // If user is logged in but hasn't completed onboarding, and not already on onboarding page
      if (user && hasCompletedOnboarding === false && location.pathname !== '/onboarding') {
        console.log("ProtectedRoute: User needs onboarding, redirecting to /onboarding");
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // If user completed onboarding but is on onboarding page, redirect to dashboard
      if (user && hasCompletedOnboarding === true && location.pathname === '/onboarding') {
        console.log("ProtectedRoute: Onboarding completed, redirecting to /kpi");
        navigate("/kpi", { replace: true });
        return;
      }
    }
  }, [user, loading, onboardingLoading, hasCompletedOnboarding, navigate, location.pathname]);
  
  if (loading || onboardingLoading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return user ? children : null;
};

export default ProtectedRoute;
