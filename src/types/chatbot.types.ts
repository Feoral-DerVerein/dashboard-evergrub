export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  cards?: import('@/components/chat/BusinessCards').BusinessCardData[];
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