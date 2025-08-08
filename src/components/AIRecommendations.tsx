import { ShoppingCart, TrendingUp, Heart, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIRecommendation {
  id: string;
  type: 'purchase' | 'demand' | 'donation' | 'optimization';
  title: string;
  description: string;
  icon: any;
  borderColor: string;
  iconColor: string;
}

const recommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Reduce tomato purchases',
    description: 'Decrease purchases by 15% next week due to low historical demand',
    icon: ShoppingCart,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500'
  },
  {
    id: '2',
    type: 'demand',
    title: 'Increase whole grain bread',
    description: 'Boost purchases by 10% due to high demand forecast this week',
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  },
  {
    id: '3',
    type: 'donation',
    title: 'Donate yogurt products',
    description: 'Products expire in 2 days, suggest donation to food bank',
    icon: Heart,
    borderColor: 'border-l-orange-500',
    iconColor: 'text-orange-500'
  },
  {
    id: '4',
    type: 'optimization',
    title: 'Redistribute dairy products',
    description: 'Move milk surplus to downtown branch to prevent losses',
    icon: RefreshCw,
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500'
  },
  {
    id: '5',
    type: 'demand',
    title: 'Coffee demand surge',
    description: 'Demand will increase 12% during university exam season',
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  }
];

const RecommendationCard = ({ recommendation }: { recommendation: AIRecommendation }) => {
  const Icon = recommendation.icon;
  
  return (
    <Card className={`border-l-4 ${recommendation.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className={`w-4 h-4 ${recommendation.iconColor}`} />
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.description}
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-7 text-xs">
            <Check className="w-3 h-3 mr-1" />
            Apply
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AIRecommendations = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Updated today
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <RecommendationCard 
            key={recommendation.id} 
            recommendation={recommendation} 
          />
        ))}
      </div>
    </div>
  );
};