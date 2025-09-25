export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  cards?: BusinessCardData[];
  timestamp: Date;
  isTyping?: boolean;
}

export interface BusinessCardData {
  id: string;
  type: 'inventory' | 'expiry' | 'sales' | 'recommendation' | 'alert' | 'analytics';
  title: string;
  subtitle?: string;
  description: string;
  primaryMetric?: string;
  secondaryMetric?: string;
  actionText?: string;
  actionType?: 'info' | 'warning' | 'success' | 'urgent';
  data?: any;
}

export type ChatIntent = 
  | 'expiring_products'
  | 'sales_analysis' 
  | 'inventory_status'
  | 'reports_status'
  | 'general_help'
  | 'business_metrics'
  | 'product_recommendations'
  | 'waste_reduction';

export interface ChatAnalytics {
  totalProducts: number;
  expiringProducts: number;
  salesThisWeek: number;
  wasteReduced: number;
  co2Saved: number;
  topCategories: Array<{ name: string; percentage: number }>;
}

export interface ChatbotResponse {
  message: string;
  intent: ChatIntent;
  data?: any;
  suggestions?: string[];
}