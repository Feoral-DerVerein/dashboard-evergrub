
import Dashboard from "@/components/Dashboard";
import { BankAccountForm } from "@/components/BankAccountForm";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-8">
      <Dashboard />
      
      <div className="max-w-md mx-auto px-4 pb-12">
        <h2 className="text-lg font-medium mb-4">Payment Settings</h2>
        <BankAccountForm />
        <div className="mt-4 text-center">
          <Link 
            to="/profile" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View and edit your complete store profile →
          </Link>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
