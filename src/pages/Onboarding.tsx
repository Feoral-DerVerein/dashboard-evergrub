import { useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

const Onboarding = () => {
  const { completeOnboarding } = useOnboarding();

  useEffect(() => {
    // Complete onboarding - ProtectedRoute will handle redirect
    completeOnboarding();
  }, [completeOnboarding]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Completando configuración...</p>
    </div>
  );
};

export default Onboarding;