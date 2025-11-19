import { DynamicGreeting } from '@/components/DynamicGreeting';
import ChatBot from "@/components/ChatBot";

export const BottomNav = () => {
  return null;
};

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <DynamicGreeting />

      {/* AI ChatBot - Main Content */}
      <ChatBot variant="inline" />
    </div>
  );
};

export default Dashboard;