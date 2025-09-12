import POSConnectionForm from "@/components/onboarding/POSConnectionForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ApiConfig = () => {
  const navigate = useNavigate();

  const handleConfigComplete = () => {
    toast.success("API configuration updated successfully!");
    navigate("/kpi");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <POSConnectionForm onComplete={handleConfigComplete} />
      </div>
    </div>
  );
};

export default ApiConfig;