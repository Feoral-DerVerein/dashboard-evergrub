interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
}
const StatCard = ({
  label,
  value,
  icon,
  onClick
}: StatCardProps) => {
  return <div onClick={onClick} className="p-4 rounded-xl text-green-800 shadow-lg transition-transform hover:scale-105 cursor-pointer bg-[#3bc66d]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-900">{label}</p>
        <div className="p-2 rounded-lg bg-zinc-800">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
    </div>;
};
export default StatCard;