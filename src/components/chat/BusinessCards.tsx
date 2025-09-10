import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Zap,
  ShoppingCart,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessCardData {
  id: string;
  type: 'inventory' | 'expiry' | 'sales' | 'recommendation' | 'alert' | 'analytics';
  title: string;
  data: any;
}

interface BusinessCardProps {
  card: BusinessCardData;
}

// Functions to handle marketplace and POS actions
const handleMarketplaceAction = async (action: string, data: any) => {
  try {
    const { error } = await supabase.functions.invoke('send-to-marketplace', {
      body: { action, data }
    });
    
    if (error) throw error;
    
    toast.success(`Successfully sent to marketplace: ${action}`);
  } catch (error) {
    console.error('Marketplace action error:', error);
    toast.error('Failed to sync with marketplace');
  }
};

const handlePOSAction = async (action: string, data: any) => {
  try {
    // Simulate POS system integration
    console.log('POS Action:', action, data);
    
    // You would implement actual POS API calls here
    // For now, we'll just show a success message
    toast.success(`POS System updated: ${action}`);
  } catch (error) {
    console.error('POS action error:', error);
    toast.error('Failed to sync with POS system');
  }
};

export const BusinessCard = ({ card }: BusinessCardProps) => {
  const renderCard = () => {
    switch (card.type) {
      case 'inventory':
        return (
          <Card className="mb-3 border-l-4 border-l-blue-500 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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

                {/* Action buttons for Marketplace and POS */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 hover:bg-blue-50"
                    onClick={() => handleMarketplaceAction('update_inventory', {
                      product: card.data.product,
                      quantity: card.data.quantity,
                      price: card.data.sell_price,
                      status: card.data.status
                    })}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Update Marketplace
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 hover:bg-green-50"
                    onClick={() => handlePOSAction('sync_inventory', {
                      product: card.data.product,
                      quantity: card.data.quantity,
                      price: card.data.sell_price
                    })}
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Sync POS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'expiry':
        const daysLeft = Math.ceil((new Date(card.data.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 2;
        
        return (
          <Card className={`mb-3 border-l-4 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
            isUrgent ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50' : 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50'
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

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="hover-scale"
                    onClick={() => handleMarketplaceAction('apply_discount', {
                      product: card.data.product,
                      quantity: card.data.quantity,
                      discount_percentage: 25
                    })}
                  >
                    Apply Discount
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="hover-scale"
                    onClick={() => handlePOSAction('mark_for_donation', {
                      product: card.data.product,
                      quantity: card.data.quantity
                    })}
                  >
                    Donate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="col-span-1"
                    onClick={() => handleMarketplaceAction('list_expiring_product', {
                      product: card.data.product,
                      quantity: card.data.quantity,
                      expiry_date: card.data.expiry_date,
                      discounted_price: card.data.sell_price * 0.75
                    })}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    List on Market
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="col-span-1"
                    onClick={() => handlePOSAction('update_pricing', {
                      product: card.data.product,
                      new_price: card.data.sell_price * 0.75,
                      reason: 'expiring_soon'
                    })}
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Update POS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'sales':
        return (
          <Card className="mb-3 border-l-4 border-l-green-500 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-green-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-green-900">${card.data.revenue}</div>
                    <div className="text-xs text-green-600">Revenue</div>
                  </div>
                  <div className="text-center bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">{card.data.units}</div>
                    <div className="text-xs text-blue-600">Units</div>
                  </div>
                  <div className="text-center bg-purple-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-purple-900">{(card.data.margin * 100).toFixed(1)}%</div>
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

                {/* Sales actions */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleMarketplaceAction('promote_product', {
                      product: card.data.topProduct,
                      promotion_type: 'featured',
                      duration: '7_days'
                    })}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Promote on Market
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handlePOSAction('create_promotion', {
                      product: card.data.topProduct,
                      discount: 15,
                      type: 'bestseller_promo'
                    })}
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Create POS Promo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'recommendation':
        return (
          <Card className="mb-3 border-l-4 border-l-purple-500 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-purple-50 to-indigo-50">
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

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white hover-scale"
                    onClick={() => handleMarketplaceAction('implement_recommendation', {
                      action: card.data.action,
                      expected_impact: card.data.impact,
                      target: 'marketplace'
                    })}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Apply to Market
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white hover-scale"
                    onClick={() => handlePOSAction('implement_recommendation', {
                      action: card.data.action,
                      expected_impact: card.data.impact,
                      target: 'pos_system'
                    })}
                  >
                    <Monitor className="w-3 h-3 mr-1" />
                    Apply to POS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'alert':
        return (
          <Card className="mb-3 border-l-4 border-l-red-500 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-red-50 to-pink-50">
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="hover-scale"
                      onClick={() => handlePOSAction('immediate_action', {
                        alert_type: card.data.severity,
                        message: card.data.message,
                        timestamp: card.data.created_at
                      })}
                    >
                      Immediate Action
                    </Button>
                    <Button size="sm" variant="outline" className="hover-scale">
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="col-span-1"
                      onClick={() => handleMarketplaceAction('alert_action', {
                        alert_type: card.data.severity,
                        message: card.data.message
                      })}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Market Alert
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="col-span-1"
                      onClick={() => handlePOSAction('system_alert', {
                        severity: card.data.severity,
                        message: card.data.message
                      })}
                    >
                      <Monitor className="w-3 h-3 mr-1" />
                      POS Alert
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <Card className="mb-3 border-l-4 border-l-indigo-500 animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                <DollarSign className="w-4 h-4" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(card.data.metrics).map(([key, value]: [string, any]) => (
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

              {/* Analytics actions */}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleMarketplaceAction('sync_analytics', {
                    metrics: card.data.metrics,
                    insights: card.data.insights
                  })}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Export to Market
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handlePOSAction('update_analytics', {
                    metrics: card.data.metrics,
                    insights: card.data.insights
                  })}
                >
                  <Monitor className="w-3 h-3 mr-1" />
                  Update POS Data
                </Button>
              </div>
            </CardContent>
          </Card>
        );

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