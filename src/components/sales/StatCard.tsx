
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, onClick }: StatCardProps) => {
  return (
    <div 
      className="bg-gradient-to-br from-green-100 to-green-300 p-4 rounded-xl text-green-800 shadow-lg transition-transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-green-700">{label}</p>
        <div className="bg-white/40 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-green-800 text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
