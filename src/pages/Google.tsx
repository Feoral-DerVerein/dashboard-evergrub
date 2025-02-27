
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Google = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link to="/dashboard" className="flex items-center text-gray-600">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-green-500">Google Startup Solutions</h1>
          <p className="mb-4 text-gray-700">
            Leverage Google's powerful search and advertising technologies to grow your startup and reach new customers.
          </p>
          <p className="text-gray-500">
            This page is currently under development. Check back soon for more features and information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Google;
