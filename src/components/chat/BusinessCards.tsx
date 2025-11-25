import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Tag,
  Zap
} from 'lucide-react';

export interface BusinessCardData {
  id: string;
  type: 'inventory' | 'expiry' | 'sales' | 'recommendation' | 'alert' | 'analytics' | 'predictive_analytics' | 'autopilot' | 'performance';
  title: string;
  data: any;
}

interface BusinessCardProps {
  card: BusinessCardData;
  onAddToTaskList?: (card: BusinessCardData, title: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
}

export const BusinessCard = ({ card, onAddToTaskList }: BusinessCardProps) => {
  
  const getTaskInfo = (cardType: string, cardData: any) => {
    switch (cardType) {
      case 'inventory':
        return {
          title: `Manage inventory: ${cardData.product}`,
          description: `${cardData.quantity} units in ${cardData.location}. Status: ${cardData.status}`,
          priority: (cardData.status === 'out_of_stock' ? 'critical' : 
                   cardData.status === 'low_stock' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical'
        };
      case 'expiry':
        const daysLeft = Math.ceil((new Date(cardData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return {
          title: `Product expiring: ${cardData.product}`,
          description: `${cardData.quantity} units expire in ${daysLeft} days`,
          priority: (daysLeft <= 2 ? 'critical' : daysLeft <= 7 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical'
        };
      case 'sales':
        return {
          title: `Review sales performance`,
          description: `Top product: ${cardData.topProduct}. Revenue: $${cardData.revenue}`,
          priority: 'medium' as const
        };
      case 'recommendation':
        return {
          title: `Implement recommendation: ${cardData.action}`,
          description: cardData.description,
          priority: 'medium' as const
        };
      case 'alert':
        return {
          title: `Address alert: ${cardData.message}`,
          description: `Severity: ${cardData.severity}`,
          priority: (cardData.severity === 'critical' ? 'critical' : 
                   cardData.severity === 'high' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical'
        };
      case 'analytics':
        return {
          title: `Review analytics: ${cardData.metric}`,
          description: `Value: ${cardData.value}`,
          priority: 'low' as const
        };
      default:
        return {
          title: 'Review information',
          description: 'New information available',
          priority: 'medium' as const
        };
    }
  };
  const renderCard = () => {
    switch (card.type) {
      case 'inventory':
        return (
          <Card className="glass-card-chatbot mb-3 border-l-4 border-l-blue-500 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <Package className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{card.data.product}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {card.data.location}
                    </p>
                  </div>
                  <Badge variant={card.data.status === 'in_stock' ? 'secondary' : card.data.status === 'low_stock' ? 'destructive' : 'outline'}>
                    {card.data.status === 'in_stock' ? 'In Stock' : 
                     card.data.status === 'low_stock' ? 'Low Stock' : 
                     card.data.status === 'expiring_soon' ? 'Expiring Soon' : 'Out of Stock'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Quantity</p>
                    <p className="text-xl font-bold text-blue-900">{card.data.quantity}</p>
                    <p className="text-xs text-blue-600">units</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Sale Price</p>
                    <p className="text-xl font-bold text-green-900">${card.data.sell_price}</p>
                    <p className="text-xs text-green-600">per unit</p>
                  </div>
                </div>

                {card.data.expiry_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{new Date(card.data.expiry_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'expiry':
        // Handle two formats: single product or summary
        if (card.data.expiry_date) {
          // Single product format
          const daysLeft = Math.ceil((new Date(card.data.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysLeft <= 2;
          
          return (
            <Card className={`glass-card-chatbot mb-3 border-l-4 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer ${
              isUrgent ? 'border-l-red-500' : 'border-l-orange-500'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm flex items-center gap-2 ${isUrgent ? 'text-red-700' : 'text-orange-700'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">{card.data.product}</h4>
                    <Badge variant={isUrgent ? 'destructive' : 'outline'} className="animate-pulse">
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{card.data.quantity}</div>
                      <div className="text-xs text-gray-600">units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">${(card.data.quantity * card.data.sell_price).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">total value</div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-60 p-3 rounded-lg border border-white border-opacity-50">
                    <p className="text-sm font-medium text-gray-800 mb-2">💡 Recommendation:</p>
                    <p className="text-sm text-gray-700">{card.data.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          // Summary format (expiringCount, totalValue)
          const expiringCount = card.data.expiringCount || 0;
          const totalValue = card.data.totalValue || 0;
          const isUrgent = expiringCount > 20;
          
          return (
            <Card className={`glass-card-chatbot mb-3 border-l-4 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer ${
              isUrgent ? 'border-l-red-500' : 'border-l-orange-500'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm flex items-center gap-2 ${isUrgent ? 'text-red-700' : 'text-orange-700'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant={isUrgent ? 'destructive' : 'outline'} className={isUrgent ? 'animate-pulse' : ''}>
                      {expiringCount > 0 ? `${expiringCount} products` : 'No urgent items'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{expiringCount}</div>
                      <div className="text-xs text-gray-600">units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">${totalValue.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">total value</div>
                    </div>
                  </div>

                  {card.data.urgentItems && card.data.urgentItems.length > 0 && (
                    <div className="bg-white bg-opacity-60 p-3 rounded-lg border border-white border-opacity-50">
                      <p className="text-sm font-medium text-gray-800 mb-2">💡 Recommendation:</p>
                      <p className="text-sm text-gray-700">
                        Priority items: {card.data.urgentItems.join(', ')}. Consider discounting or donating these products.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }

      case 'sales':
        return (
          <Card className="glass-card-chatbot mb-3 border-l-4 border-l-green-500 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-green-50 p-3 rounded-lg min-h-[80px] flex flex-col justify-center">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-green-900 break-words">${card.data.revenue}</div>
                    <div className="text-xs text-green-600">Revenue</div>
                  </div>
                  <div className="text-center bg-blue-50 p-3 rounded-lg min-h-[80px] flex flex-col justify-center">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900 break-words">{card.data.units}</div>
                    <div className="text-xs text-blue-600">Units</div>
                  </div>
                  <div className="text-center bg-purple-50 p-3 rounded-lg min-h-[80px] flex flex-col justify-center">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-purple-900 break-words">{(card.data.margin * 100).toFixed(1)}%</div>
                    <div className="text-xs text-purple-600">Margin</div>
                  </div>
                </div>

                {card.data.topProduct && (
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Top Product</p>
                      <p className="text-lg font-bold text-gray-900">{card.data.topProduct}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">{card.data.growth}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'recommendation':
        return (
          <Card className="glass-card-chatbot mb-3 border-l-4 border-l-purple-500 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                <Zap className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{card.data.action}</h4>
                    <p className="text-sm text-gray-700">{card.data.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Expected Impact</p>
                    <p className="text-lg font-bold text-purple-900">{card.data.impact}</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Potential Savings</p>
                    <p className="text-lg font-bold text-green-900">{card.data.savings}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'alert':
        return (
          <Card className="glass-card-chatbot mb-3 border-l-4 border-l-red-500 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">{card.data.message}</h4>
                  <Badge variant="destructive" className={card.data.severity === 'critical' ? 'animate-pulse' : ''}>
                    {card.data.severity === 'critical' ? 'Critical' : 
                     card.data.severity === 'high' ? 'High' : 
                     card.data.severity === 'medium' ? 'Medium' : 'Low'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Detected: {new Date(card.data.created_at).toLocaleString('en-GB')}</span>
                </div>

                {card.data.action_required && (
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg border border-white border-opacity-50">
                    <p className="text-sm font-medium text-red-800 mb-1">⚠️ Action Required:</p>
                    <p className="text-sm text-red-700">{card.data.action_required}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <Card className="glass-card-chatbot mb-3 border-l-4 border-l-indigo-500 animate-fade-in hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                <DollarSign className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                {card.data.metrics && Object.entries(card.data.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center bg-indigo-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-indigo-900">{value}</div>
                    <div className="text-xs text-indigo-600 capitalize">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>

              {card.data.insights && (
                <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-1">📊 Insights:</p>
                  <p className="text-sm text-gray-700">{card.data.insights}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'predictive_analytics':
      case 'autopilot':
      case 'performance':
        // These cards will be rendered using their dedicated components
        return null;

      default:
        return null;
    }
  };

  return renderCard();
};

// Loading card component
export const LoadingCard = () => (
  <Card className="mb-3 animate-pulse">
    <CardHeader className="pb-3">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </CardContent>
  </Card>
);