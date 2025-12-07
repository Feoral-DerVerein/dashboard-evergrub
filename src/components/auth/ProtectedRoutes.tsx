import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If no user, redirect to home/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if onboarding is completed
  // If not completed and NOT currently on the onboarding page, redirect to onboarding
  if (profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
