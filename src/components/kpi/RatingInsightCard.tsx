import { Star, ThumbsUp } from "lucide-react";

interface RatingInsightCardProps {
  label: string;
  rating?: number;
  percentage?: number;
  status: string;
}

const RatingInsightCard = ({ label, rating, percentage, status }: RatingInsightCardProps) => {
  const displayValue = rating ? `${rating}` : `${percentage}%`;
  const showStar = rating !== undefined;
  
  return (
    <div className="glass-card rounded-xl p-4 h-full min-h-28 flex flex-col justify-between">
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-2xl font-semibold">{displayValue}</span>
          {showStar && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-emerald-500">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingInsightCard;