import Dashboard from "@/components/Dashboard";
import { BankAccountForm } from "@/components/BankAccountForm";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="space-y-8">
      <Dashboard />
      
      
      
      <Toaster />
    </div>;
};
export default Index;