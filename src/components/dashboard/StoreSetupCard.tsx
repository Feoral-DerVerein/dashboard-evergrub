
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Store } from "../icons/Store";

const StoreSetupCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div className="mr-4 bg-blue-100 p-3 rounded-full">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-blue-800 mb-1">Set up your store</h3>
            <p className="text-sm text-blue-700 mb-3">
              Create your store profile to start selling on the marketplace
            </p>
            <button
              onClick={() => navigate('/store-profile')}
              className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Store Profile
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreSetupCard;
