
import { BottomNav } from "@/components/Dashboard";
import { ArrowLeft, ShoppingBag, Settings, UserPlus, FileText, BarChart2, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ActionButton = ({ icon: Icon, label, to }: { icon: any; label: string; to: string }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
  >
    <Icon className="w-6 h-6 text-gray-600 mb-2" />
    <span className="text-sm text-gray-600">{label}</span>
  </Link>
);

const Plus = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">More Options</h1>
          </div>
        </header>

        <main className="px-6">
          <div className="grid grid-cols-2 gap-4">
            <ActionButton
              icon={ShoppingBag}
              label="Add Product"
              to="/products/add"
            />
            <ActionButton
              icon={UserPlus}
              label="Add User"
              to="/users/add"
            />
            <ActionButton
              icon={FileText}
              label="Reports"
              to="/reports"
            />
            <ActionButton
              icon={BarChart2}
              label="Analytics"
              to="/analytics"
            />
            <ActionButton
              icon={MessageSquare}
              label="Support"
              to="/support"
            />
            <ActionButton
              icon={Settings}
              label="Settings"
              to="/settings"
            />
            <ActionButton
              icon={HelpCircle}
              label="Help Center"
              to="/help"
            />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Plus;
