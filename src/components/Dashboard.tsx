
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./dashboard/DashboardHeader";
import StoreSetupCard from "./dashboard/StoreSetupCard";
import SalesOverviewCard from "./dashboard/SalesOverviewCard";
import StatCards from "./dashboard/StatCards";
import RecentOrdersSection from "./dashboard/RecentOrdersSection";
import QuickActionsSection from "./dashboard/QuickActionsSection";
import BottomNav from "./navigation/BottomNav";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/');
    } else {
      setUserProfile(JSON.parse(userJson));
    }
    
    // Check if store profile exists
    const storeJson = localStorage.getItem('storeProfile');
    if (storeJson) {
      setStoreProfile(JSON.parse(storeJson));
    }
  }, [navigate]);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-md mx-auto bg-white">
        <DashboardHeader userProfile={userProfile} />

        <main className="p-6 space-y-6">
          {!storeProfile ? (
            <StoreSetupCard />
          ) : (
            <SalesOverviewCard />
          )}

          <StatCards />
          <RecentOrdersSection />
          <QuickActionsSection />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
