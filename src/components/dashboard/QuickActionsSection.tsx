
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Settings, Package, TrendingUp } from "lucide-react";

const QuickActionsSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/products/add')}
          className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-sm font-medium">Add Product</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={() => navigate('/parcel')}
          className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
            <Package className="h-5 w-5 text-amber-600" />
          </div>
          <span className="text-sm font-medium">Track Order</span>
        </button>
        <button
          onClick={() => navigate('/sales')}
          className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium">View Sales</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActionsSection;
