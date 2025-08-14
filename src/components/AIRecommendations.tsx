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

export const AIRecommendations = ({ 
  predictiveData, 
  realData 
}: { 
  predictiveData?: any; 
  realData?: any; 
}) => {
  // Generate dynamic recommendations based on real data
  const dynamicRecommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'purchase',
      title: `Monitor ${predictiveData?.overstockedItem || 'inventory levels'}`,
      description: `Consider reducing purchases of ${predictiveData?.overstockedItem || 'overstocked items'} - ${predictiveData?.overstockAmount || 'excess detected'}`,
      icon: ShoppingCart,
      borderColor: 'border-l-red-500',
      iconColor: 'text-red-500'
    },
    {
      id: '2',
      type: 'demand',
      title: `Boost ${predictiveData?.topSellingProduct || 'top products'}`,
      description: `Increase stock of ${predictiveData?.topSellingProduct || 'high-demand products'} - ${predictiveData?.topSellingRate || '0%'} performance rate`,
      icon: TrendingUp,
      borderColor: 'border-l-green-500',
      iconColor: 'text-green-500'
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Optimize reorder timing',
      description: `Consider reordering ${predictiveData?.reorderCategory || 'products'} in ${predictiveData?.optimalReorder || '3'} days for better efficiency`,
      icon: RefreshCw,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      id: '4',
      type: 'demand',
      title: 'Demand forecast analysis',
      description: `Expected ${predictiveData?.demandForecast || '+15%'} demand increase ${predictiveData?.forecastPeriod || 'next week'} - prepare accordingly`,
      icon: TrendingUp,
      borderColor: 'border-l-green-500',
      iconColor: 'text-green-500'
    },
    {
      id: '5',
      type: 'donation',
      title: 'Sustainability impact',
      description: `Current CO₂ savings: ${realData?.co2Saved || '0 kg'} - maintain eco-friendly practices`,
      icon: Heart,
      borderColor: 'border-l-orange-500',
      iconColor: 'text-orange-500'
    }
  ];

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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">Smart insights for your inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Live Data</span>
        </div>
      </div>

      {/* Grouped Recommendations */}
      <div className="space-y-6">
        {Object.entries(groupedRecommendations).map(([type, recommendations]) => {
          const TypeIcon = typeIcons[type as keyof typeof typeIcons];
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <TypeIcon className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {typeLabels[type as keyof typeof typeLabels]}
                </h4>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {recommendations.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((recommendation) => (
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
    </div>
  );
};