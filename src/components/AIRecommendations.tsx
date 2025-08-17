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
const recommendations: AIRecommendation[] = [{
  id: '1',
  type: 'purchase',
  title: 'Reduce oat milk orders',
  description: 'Decrease oat milk purchases by 15% next week due to low demand',
  icon: ShoppingCart,
  borderColor: 'border-l-red-500',
  iconColor: 'text-red-500'
}, {
  id: '2',
  type: 'demand',
  title: 'Stock more flat white beans',
  description: 'Boost Ethiopian coffee bean orders by 20% - high Melbourne demand',
  icon: TrendingUp,
  borderColor: 'border-l-green-500',
  iconColor: 'text-green-500'
}, {
  id: '3',
  type: 'donation',
  title: 'Donate day-old pastries',
  description: 'Croissants and muffins expire today, donate to local shelter',
  icon: Heart,
  borderColor: 'border-l-orange-500',
  iconColor: 'text-orange-500'
}, {
  id: '4',
  type: 'optimization',
  title: 'Relocate barista equipment',
  description: 'Move backup espresso machine to morning rush station',
  icon: RefreshCw,
  borderColor: 'border-l-blue-500',
  iconColor: 'text-blue-500'
}, {
  id: '5',
  type: 'demand',
  title: 'Winter coffee surge',
  description: 'Hot coffee demand will increase 25% during Melbourne winter',
  icon: TrendingUp,
  borderColor: 'border-l-green-500',
  iconColor: 'text-green-500'
}];
const RecommendationCard = ({
  recommendation
}: {
  recommendation: AIRecommendation;
}) => {
  const Icon = recommendation.icon;
  return <Card className={`border-l-4 ${recommendation.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
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
    </Card>;
};
export const AIRecommendations = ({
  predictiveData,
  realData
}: {
  predictiveData?: any;
  realData?: any;
}) => {
  // Generate dynamic recommendations based on real data for Melbourne coffee shop
  const dynamicRecommendations: AIRecommendation[] = [{
    id: '1',
    type: 'purchase',
    title: `Monitor ${predictiveData?.overstockedItem || 'coffee bean inventory'}`,
    description: `Consider reducing purchases of ${predictiveData?.overstockedItem || 'slow-moving beans'} - ${predictiveData?.overstockAmount || 'excess detected'}`,
    icon: ShoppingCart,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500'
  }, {
    id: '2',
    type: 'demand',
    title: `Boost ${predictiveData?.topSellingProduct || 'flat white beans'}`,
    description: `Increase stock of ${predictiveData?.topSellingProduct || 'premium coffee beans'} - ${predictiveData?.topSellingRate || '85%'} customer satisfaction`,
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  }, {
    id: '3',
    type: 'optimization',
    title: 'Optimize barista scheduling',
    description: `Consider adjusting ${predictiveData?.reorderCategory || 'staff schedules'} in ${predictiveData?.optimalReorder || '2'} days for morning rush`,
    icon: RefreshCw,
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500'
  }, {
    id: '4',
    type: 'demand',
    title: 'Melbourne coffee trends',
    description: `Expected ${predictiveData?.demandForecast || '+20%'} demand increase ${predictiveData?.forecastPeriod || 'during winter'} - stock accordingly`,
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  }, {
    id: '5',
    type: 'donation',
    title: 'Coffee grounds composting',
    description: `Current CO₂ savings: ${realData?.co2Saved || '45 kg'} - donate used grounds to local gardens`,
    icon: Heart,
    borderColor: 'border-l-orange-500',
    iconColor: 'text-orange-500'
  }];

  // Group recommendations by type
  const groupedRecommendations = dynamicRecommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, AIRecommendation[]>);
  const typeLabels = {
    purchase: 'Purchase Optimization',
    demand: 'Demand Management',
    donation: 'Sustainability',
    optimization: 'Operations'
  };
  const typeIcons = {
    purchase: ShoppingCart,
    demand: TrendingUp,
    donation: Heart,
    optimization: RefreshCw
  };
  return (
    <div className="space-y-6">
      {Object.entries(groupedRecommendations).map(([type, recs]) => {
        const TypeIcon = typeIcons[type as keyof typeof typeIcons];
        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <TypeIcon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                {typeLabels[type as keyof typeof typeLabels]}
              </h3>
            </div>
            <div className="grid gap-3">
              {recs.map((recommendation) => (
                <RecommendationCard 
                  key={recommendation.id} 
                  recommendation={recommendation} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};