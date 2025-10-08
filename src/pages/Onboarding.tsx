import { useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    // Complete onboarding automatically and redirect to dashboard
    completeOnboarding();
    navigate("/kpi");
  }, [completeOnboarding, navigate]);

  return null;
};

export default Onboarding;