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
    <div className="apple-card-hover p-6 h-full min-h-32 flex flex-col justify-between bg-gradient-to-br from-violet-50/80 to-purple-100/80 backdrop-blur-sm border border-violet-200/50">
      <div className="text-violet-700/80 text-sm font-medium mb-3">{label}</div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl font-semibold text-violet-900 tracking-tight">{displayValue}</span>
          {showStar && <Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-600">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingInsightCard;