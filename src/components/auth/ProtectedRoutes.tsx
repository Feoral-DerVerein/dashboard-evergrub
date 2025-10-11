
import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    if (!loading && !onboardingLoading) {
      setIsChecking(false);
    }
  }, [loading, onboardingLoading]);
  
  // Show loading state
  if (loading || onboardingLoading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  // If no user, redirect to home
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /");
    return <Navigate to="/" replace />;
  }
  
  // If user hasn't completed onboarding and not on onboarding page
  if (hasCompletedOnboarding === false && location.pathname !== '/onboarding') {
    console.log("ProtectedRoute: User needs onboarding, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // If user completed onboarding but is on onboarding page
  if (hasCompletedOnboarding === true && location.pathname === '/onboarding') {
    console.log("ProtectedRoute: Onboarding completed, redirecting to /kpi");
    return <Navigate to="/kpi" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
