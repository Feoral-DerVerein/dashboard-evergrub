export interface ProductCardData {
  id: string;
  name: string;
  category: string;
  original_price: number;
  days_until_expiry: number;
  suggested_discount: number;
  urgency_level: 'critical' | 'high' | 'medium' | 'low';
  image?: string;
  quantity?: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  cards?: import('@/components/chat/BusinessCards').BusinessCardData[];
  product_cards?: ProductCardData[];
  timestamp: Date;
  isTyping?: boolean;
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