
import Dashboard from "@/components/Dashboard";
import Startup from "@/components/Startup";

const Index = () => {
  return (
    <div>
      <div className="px-4 pt-4">
        <Startup />
      </div>
      <Dashboard />
    </div>
  );
};

export default Index;
