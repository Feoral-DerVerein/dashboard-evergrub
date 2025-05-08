
import Dashboard from "@/components/Dashboard";
import { BankAccountForm } from "@/components/BankAccountForm";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-8">
      <Dashboard />
      
      <div className="px-4 py-2">
        <h2 className="text-2xl font-bold mb-4">Banking Details</h2>
        <p className="text-gray-500 mb-4">
          Set up your banking details to receive payments. You can also manage your banking details 
          on your <Link to="/profile" className="text-blue-600 hover:underline">profile page</Link>.
        </p>
        <BankAccountForm />
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
