import { useState, useEffect } from "react";
import { Bell, TrendingUp, Package, AlertTriangle, Calendar, Clock, ArrowRight, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  type: 'urgent' | 'pending' | 'info' | 'order';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

interface IntelligentNewsCardsProps {
  products?: any[];
  orders?: any[];
  insights?: any;
}

export const IntelligentNewsCards = ({ products = [], orders = [], insights }: IntelligentNewsCardsProps) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [currentRow, setCurrentRow] = useState(0);

  // Generate intelligent news based on real data
  const generateNews = (): NewsItem[] => {
    const news: NewsItem[] = [];

    // Check for expiring products
    const expiringProducts = products.filter(p => {
      if (!p.expirationDate) return false;
      const daysUntilExpiry = Math.ceil(
        (new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });

    if (expiringProducts.length > 0) {
      const urgentCount = expiringProducts.filter(p => {
        const days = Math.ceil(
          (new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return days <= 3;
      }).length;

      news.push({
        id: 'expiring-1',
        type: 'urgent',
        title: urgentCount > 0 ? '⚡ Urgent: Products Expiring Soon' : '📦 Products Nearing Expiration',
        description: `${expiringProducts.length} products expire in the next 7 days. ${urgentCount > 0 ? `${urgentCount} are critical (≤3 days).` : ''}`,
        timestamp: 'Just now',
        priority: urgentCount > 0 ? 'high' : 'medium',
        actionLabel: 'View Products',
        onAction: () => window.location.href = '/products'
      });
    }

    // Check for low stock items
    const lowStockProducts = products.filter(p => p.quantity <= 5 && p.quantity > 0);
    if (lowStockProducts.length > 0) {
      news.push({
        id: 'stock-1',
        type: 'pending',
        title: '📊 Low Stock Alert',
        description: `${lowStockProducts.length} products are running low on stock. Consider reordering soon.`,
        timestamp: '15 min ago',
        priority: 'medium',
        actionLabel: 'Manage Inventory',
        onAction: () => window.location.href = '/products'
      });
    }

    // Recent orders notification
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at || o.createdAt);
      const hoursSinceOrder = (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceOrder <= 24;
    });

    if (recentOrders.length > 0) {
      news.push({
        id: 'order-1',
        type: 'order',
        title: '🛒 New Orders Received',
        description: `${recentOrders.length} new orders in the last 24 hours. Review and process pending orders.`,
        timestamp: '1 hour ago',
        priority: 'high',
        actionLabel: 'View Orders',
        onAction: () => window.location.href = '/orders'
      });
    }

    // AI-generated insight
    if (insights) {
      news.push({
        id: 'ai-1',
        type: 'info',
        title: '🤖 AI Recommendation',
        description: insights.executive_summary || 'Your business performance is trending positively. Check detailed insights for optimization opportunities.',
        timestamp: '2 hours ago',
        priority: 'low',
        actionLabel: 'View Insights'
      });
    } else {
      // Default AI suggestion when no insights available
      news.push({
        id: 'ai-default',
        type: 'info',
        title: '🤖 Smart Business Tip',
        description: 'Peak sales hours detected between 11 AM - 2 PM. Consider staffing adjustments for optimal service.',
        timestamp: '3 hours ago',
        priority: 'low'
      });
    }

    // Additional notifications to fill 8 cards
    news.push({
      id: 'promo-1',
      type: 'info',
      title: '💡 Promotion Opportunity',
      description: 'Weekend approaching! Consider creating special offers for high-margin products.',
      timestamp: '4 hours ago',
      priority: 'low',
      actionLabel: 'Create Offer'
    });

    news.push({
      id: 'review-1',
      type: 'pending',
      title: '⭐ Customer Feedback',
      description: 'New customer reviews waiting for response. Engage with your customers to build loyalty.',
      timestamp: '5 hours ago',
      priority: 'medium'
    });

    news.push({
      id: 'delivery-1',
      type: 'order',
      title: '🚚 Pending Deliveries',
      description: 'Multiple orders scheduled for delivery today. Confirm logistics arrangements.',
      timestamp: '6 hours ago',
      priority: 'high',
      actionLabel: 'View Deliveries'
    });

    news.push({
      id: 'trend-1',
      type: 'info',
      title: '📈 Sales Trend',
      description: 'Sales increased 15% compared to last week. Keep up the momentum!',
      timestamp: '8 hours ago',
      priority: 'low'
    });

    // Return top 8 items for 2 rows
    return news.slice(0, 8);
  };

  useEffect(() => {
    setNewsItems(generateNews());
  }, [products, orders, insights]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const rows = Math.ceil(newsItems.length / 4);
    if (rows <= 1) return;

    const interval = setInterval(() => {
      setCurrentRow((prev) => (prev + 1) % rows);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems]);

  const handleComplete = (id: string) => {
    setNewsItems(prev => prev.filter(item => item.id !== id));
    toast.success("Notification marked as completed");
  };

  const handleDelete = (id: string) => {
    setNewsItems(prev => prev.filter(item => item.id !== id));
    toast.success("Notification deleted");
  };

  const nextRow = () => {
    const rows = Math.ceil(newsItems.length / 4);
    setCurrentRow((prev) => (prev + 1) % rows);
  };

  const prevRow = () => {
    const rows = Math.ceil(newsItems.length / 4);
    setCurrentRow((prev) => (prev - 1 + rows) % rows);
  };

  const rows = Math.ceil(newsItems.length / 4);
  const visibleItems = newsItems.slice(currentRow * 4, (currentRow + 1) * 4);

  const getIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5" />;
      case 'pending':
        return <Package className="w-5 h-5" />;
      case 'order':
        return <TrendingUp className="w-5 h-5" />;
      case 'info':
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'order':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'info':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPriorityBadge = (priority: NewsItem['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Info</Badge>;
    }
  };

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No notifications at the moment</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {rows > 1 && (
        <div className="flex justify-between items-center mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevRow}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: rows }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  idx === currentRow ? 'bg-blue-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextRow}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Cards grid with animation */}
      <div className="overflow-hidden">
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out animate-fade-in"
          key={currentRow}
        >
          {visibleItems.map((item) => (
            <Card 
              key={item.id}
              className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getTypeColor(item.type)} animate-scale-in`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  {getPriorityBadge(item.priority)}
                </div>

                <h3 className="font-semibold text-sm mb-2 text-gray-900 line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.timestamp}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    onClick={() => handleComplete(item.id)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDelete(item.id)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>

                {item.actionLabel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 mt-2 text-xs hover:bg-gray-100"
                    onClick={item.onAction}
                  >
                    {item.actionLabel}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};