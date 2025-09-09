import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Bot,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  cards?: InfoCard[];
  timestamp: Date;
}

interface InfoCard {
  id: string;
  type: 'inventory' | 'alert' | 'prediction' | 'sales' | 'weather' | 'general';
  title: string;
  data: any;
}

interface ChatBotProps {
  variant?: 'floating' | 'inline';
}

const ChatBot = ({ variant = 'floating' }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'inline' ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. Ask me about inventory, sales, visitor predictions, product alerts, or any information about your business.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateInfoCards = (question: string, response: string): InfoCard[] => {
    const lowerQuestion = question.toLowerCase();
    const cards: InfoCard[] = [];

    // Inventory-related cards
    if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock') || lowerQuestion.includes('products')) {
      cards.push({
        id: 'inventory-1',
        type: 'inventory',
        title: 'Inventory Recommendations',
        data: {
          product: 'Decaf Coffee Beans',
          current: '12 kg',
          recommended: '8 kg (-33%)',
          reason: 'Low demand, slow rotation in market',
          priority: 'high',
          savings: '$180'
        }
      });
    }

    // Sales and predictions
    if (lowerQuestion.includes('sales') || lowerQuestion.includes('prediction') || lowerQuestion.includes('trends')) {
      cards.push({
        id: 'sales-1',
        type: 'sales',
        title: 'Sales Analysis',
        data: {
          topProduct: 'Flat White Blend',
          salesIncrease: '+18%',
          revenue: '$2,450',
          trend: 'up'
        }
      });
    }

    // Visitor predictions
    if (lowerQuestion.includes('visitors') || lowerQuestion.includes('customers') || lowerQuestion.includes('flow')) {
      cards.push({
        id: 'visitors-1',
        type: 'prediction',
        title: 'Visitor Prediction',
        data: {
          expected: 86,
          confidence: '83%',
          peakHour: '1:00 PM',
          trend: 'stable',
          factors: ['Weekday', 'Historical patterns', 'Regular hours']
        }
      });
    }

    // Alerts and expiration
    if (lowerQuestion.includes('alert') || lowerQuestion.includes('expiration') || lowerQuestion.includes('expires')) {
      cards.push({
        id: 'alert-1',
        type: 'alert',
        title: 'Priority Alerts',
        data: {
          product: 'Almond Croissants',
          daysLeft: 2,
          quantity: '18 units',
          suggestion: '50% discount after 3pm or donate to shelter',
          priority: 'critical'
        }
      });
    }

    // General business info
    if (lowerQuestion.includes('business') || lowerQuestion.includes('summary') || lowerQuestion.includes('status')) {
      cards.push({
        id: 'general-1',
        type: 'general',
        title: 'Business Status',
        data: {
          totalProducts: 45,
          todayOrders: 23,
          revenue: '$1,245',
          efficiency: '92%',
          status: 'Excellent'
        }
      });
    }

    return cards;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call AI service to get response
      const { data, error } = await supabase.functions.invoke('chatbot-ai-response', {
        body: { question: inputValue }
      });

      if (error) throw error;

      const botResponse = data?.response || 'Sorry, I couldn\'t process your query at the moment.';
      const cards = generateInfoCards(inputValue, botResponse);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        cards: cards,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackResponse = generateFallbackResponse(inputValue);
      const cards = generateInfoCards(inputValue, fallbackResponse);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse,
        cards: cards,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock')) {
      return 'Based on analysis of your current inventory, I\'ve identified some important recommendations to optimize your stock and reduce waste.';
    }
    
    if (lowerQuestion.includes('sales') || lowerQuestion.includes('prediction')) {
      return 'Here\'s the latest sales analysis with predictions based on historical patterns and market trends.';
    }
    
    if (lowerQuestion.includes('visitors') || lowerQuestion.includes('customers')) {
      return 'I\'ve generated a visitor prediction for today based on historical patterns, day of the week, and external factors.';
    }
    
    if (lowerQuestion.includes('alert') || lowerQuestion.includes('expiration')) {
      return 'I\'ve detected some products that require immediate attention to avoid waste and maximize profits.';
    }

    return 'I\'ve analyzed your query and generated relevant information based on your business\'s current data.';
  };

  const renderInfoCard = (card: InfoCard) => {
    switch (card.type) {
      case 'inventory':
        return (
          <Card className="mb-3 border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{card.data.product}</span>
                  <Badge variant={card.data.priority === 'high' ? 'destructive' : 'secondary'}>
                    {card.data.priority === 'high' ? 'High' : 'Medium'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{card.data.reason}</p>
                <div className="flex justify-between">
                  <span>Current: {card.data.current}</span>
                  <span className="text-green-600">Rec: {card.data.recommended}</span>
                </div>
                <div className="text-sm text-green-600">Savings: {card.data.savings}</div>
              </div>
            </CardContent>
          </Card>
        );

      case 'sales':
        return (
          <Card className="mb-3 border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Top Product:</span>
                  <span className="font-medium">{card.data.topProduct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Growth:</span>
                  <div className="flex items-center gap-1">
                    {card.data.trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                    <span className={card.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {card.data.salesIncrease}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium text-green-600">{card.data.revenue}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'prediction':
        return (
          <Card className="mb-3 border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Expected visitors:</span>
                  <span className="text-2xl font-bold">{card.data.expected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="text-green-600">{card.data.confidence}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak hour:</span>
                  <span className="font-medium">{card.data.peakHour}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500">Factors: </span>
                  {card.data.factors.join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'alert':
        return (
          <Card className="mb-3 border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{card.data.product}</span>
                  <Badge variant="destructive">{card.data.daysLeft} días</Badge>
                </div>
                <div className="text-sm text-gray-600">{card.data.quantity}</div>
                <div className="text-sm bg-yellow-50 p-2 rounded">
                  💡 {card.data.suggestion}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'general':
        return (
          <Card className="mb-3 border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Products</div>
                  <div className="font-bold">{card.data.totalProducts}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Orders Today</div>
                  <div className="font-bold">{card.data.todayOrders}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Revenue</div>
                  <div className="font-bold text-green-600">{card.data.revenue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Efficiency</div>
                  <div className="font-bold">{card.data.efficiency}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!isOpen && variant === 'floating') {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <Card className="w-full mb-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/36df130d-8ed4-4575-83ca-48fceb08f995.png" alt="Gro Logo" className="w-5 h-5 object-contain" />
            <span className="font-medium text-blue-800">What information do you need today?</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-blue-600 hover:bg-blue-100 h-8 w-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {!isMinimized && (
          <CardContent className="p-4">
            {/* Input Section */}
            <div className="flex gap-3 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What would you like to know about your inventory, sales, visitors, or alerts?"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Recent Messages - Show last 2 messages only in inline mode */}
            {messages.length > 1 && (
              <div className="space-y-3">
                {messages.slice(-2).map((message) => (
                  <div key={message.id} className={`${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-50 text-gray-800 border'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      {message.type === 'bot' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Render info cards horizontally for bot messages */}
                    {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                        {message.cards.map(renderInfoCard)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  // Floating version (original design)

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/36df130d-8ed4-4575-83ca-48fceb08f995.png" alt="Gro Logo" className="w-5 h-5 object-contain" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-64 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-sm">{message.content}</div>
                  {message.type === 'bot' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                {/* Render info cards for bot messages */}
                {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                  <div className="mt-3 text-left">
                    {message.cards.map(renderInfoCard)}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mb-4">
                <div className="inline-block bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about your business..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                size="sm"
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;