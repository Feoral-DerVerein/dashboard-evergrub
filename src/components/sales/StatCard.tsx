
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-4 rounded-xl text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-green-100">{label}</p>
        <div className="bg-white/20 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
