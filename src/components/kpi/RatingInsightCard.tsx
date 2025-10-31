import { Star } from "lucide-react";

interface RatingInsightCardProps {
  label: string;
  rating?: number;
  percentage?: number;
  status: string;
}

const RatingInsightCard = ({ label, rating, percentage, status }: RatingInsightCardProps) => {
  const displayValue = rating ? `${rating}` : `${percentage}%`;
  
  return (
    <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-foreground text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-blue-900">{displayValue}</span>
        {rating !== undefined && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
      </div>
    </div>
  );
};

export default RatingInsightCard;