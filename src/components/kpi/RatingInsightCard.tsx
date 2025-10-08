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
    <div className="bg-white rounded-2xl p-6 h-[180px] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex flex-col gap-2">
        <h4 className="text-purple-600 text-base font-normal">{label}</h4>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-5xl font-bold text-purple-900">{displayValue}</span>
          {showStar && <Star className="w-8 h-8 text-amber-500 fill-amber-500" />}
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-600 text-base font-normal">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingInsightCard;