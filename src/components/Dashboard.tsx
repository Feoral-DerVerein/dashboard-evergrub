import { DynamicGreeting } from '@/components/DynamicGreeting';
import { AladdinChatPanel } from '@/components/ai/AladdinChatPanel';

export const BottomNav = () => {
  return null;
};

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <DynamicGreeting />

      {/* Negen AI Assistant - Main Content */}
      <div className="max-w-5xl mx-auto">
        <AladdinChatPanel />
      </div>
    </div>
  );
};

export default Dashboard;