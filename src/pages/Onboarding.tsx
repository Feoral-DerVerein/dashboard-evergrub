import POSConnectionForm from "@/components/onboarding/POSConnectionForm";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleOnboardingComplete = () => {
    completeOnboarding();
    navigate("/kpi");
  };

  return <POSConnectionForm onComplete={handleOnboardingComplete} />;
};

export default Onboarding;