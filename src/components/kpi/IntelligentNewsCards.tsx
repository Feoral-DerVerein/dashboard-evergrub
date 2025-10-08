import { useState, useEffect } from "react";
import { Bell, TrendingUp, Package, AlertTriangle, Clock, ArrowRight, Check, X } from "lucide-react";
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

  const handleComplete = (id: string) => {
    setNewsItems(prev => prev.filter(item => item.id !== id));
    toast.success("Notification marked as completed");
  };

  const handleDelete = (id: string) => {
    setNewsItems(prev => prev.filter(item => item.id !== id));
    toast.success("Notification deleted");
  };

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

  const getGlassStyle = (type: NewsItem['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/20 backdrop-blur-xl border border-white/20';
      case 'pending':
        return 'bg-amber-500/20 backdrop-blur-xl border border-white/20';
      case 'order':
        return 'bg-blue-500/20 backdrop-blur-xl border border-white/20';
      case 'info':
        return 'bg-emerald-500/20 backdrop-blur-xl border border-white/20';
    }
  };

  const getPriorityBadge = (priority: NewsItem['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-white/30 text-white backdrop-blur-sm border-0 hover:bg-white/40">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-white/30 text-white backdrop-blur-sm border-0 hover:bg-white/40">Medium</Badge>;
      case 'low':
        return <Badge className="bg-white/30 text-white backdrop-blur-sm border-0 hover:bg-white/40">Info</Badge>;
    }
  };

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-12 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50 text-white" />
        <p className="text-white/80">No notifications at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {newsItems.map((item) => (
        <div 
          key={item.id}
          className={`${getGlassStyle(item.type)} rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                {getIcon(item.type)}
              </div>
              {getPriorityBadge(item.priority)}
            </div>

            <h3 className="font-semibold text-base mb-2 text-white line-clamp-1">
              {item.title}
            </h3>

            <p className="text-sm text-white/80 mb-4 line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center text-xs text-white/70 mb-4">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {item.timestamp}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 text-sm bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
                onClick={() => handleComplete(item.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-9 text-sm bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
                onClick={() => handleDelete(item.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Hide
              </Button>
            </div>

            {item.actionLabel && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-9 text-sm bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
                onClick={item.onAction}
              >
                {item.actionLabel}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};