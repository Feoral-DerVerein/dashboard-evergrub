
import Dashboard from "@/components/Dashboard";
import { BankAccountForm } from "@/components/BankAccountForm";
import { FundsSimulator } from "@/components/FundsSimulator";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="space-y-8">
      <Dashboard />
      
      <div className="max-w-md mx-auto px-4 pb-12">
        <div className="space-y-8">
          <FundsSimulator />
          <BankAccountForm />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
