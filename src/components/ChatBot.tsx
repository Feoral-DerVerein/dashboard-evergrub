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
  Bot
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
      content: '¡Hola! Soy tu asistente de IA. Pregúntame sobre inventario, ventas, predicciones de visitantes, alertas de productos o cualquier información de tu negocio.',
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
    if (lowerQuestion.includes('inventario') || lowerQuestion.includes('stock') || lowerQuestion.includes('productos')) {
      cards.push({
        id: 'inventory-1',
        type: 'inventory',
        title: 'Recomendaciones de Inventario',
        data: {
          product: 'Café Descafeinado',
          current: '12 kg',
          recommended: '8 kg (-33%)',
          reason: 'Baja demanda, rotación lenta en el mercado',
          priority: 'high',
          savings: '$180'
        }
      });
    }

    // Sales and predictions
    if (lowerQuestion.includes('ventas') || lowerQuestion.includes('prediccion') || lowerQuestion.includes('tendencia')) {
      cards.push({
        id: 'sales-1',
        type: 'sales',
        title: 'Análisis de Ventas',
        data: {
          topProduct: 'Flat White Blend',
          salesIncrease: '+18%',
          revenue: '$2,450',
          trend: 'up'
        }
      });
    }

    // Visitor predictions
    if (lowerQuestion.includes('visitantes') || lowerQuestion.includes('clientes') || lowerQuestion.includes('flujo')) {
      cards.push({
        id: 'visitors-1',
        type: 'prediction',
        title: 'Predicción de Visitantes',
        data: {
          expected: 86,
          confidence: '83%',
          peakHour: '1:00 PM',
          trend: 'stable',
          factors: ['Día laboral', 'Patrones históricos', 'Horas regulares']
        }
      });
    }

    // Alerts and expiration
    if (lowerQuestion.includes('alerta') || lowerQuestion.includes('vencimiento') || lowerQuestion.includes('expira')) {
      cards.push({
        id: 'alert-1',
        type: 'alert',
        title: 'Alertas Prioritarias',
        data: {
          product: 'Croissants de Almendra',
          daysLeft: 2,
          quantity: '18 unidades',
          suggestion: '50% descuento después de 3pm o donar al refugio',
          priority: 'critical'
        }
      });
    }

    // General business info
    if (lowerQuestion.includes('negocio') || lowerQuestion.includes('resumen') || lowerQuestion.includes('estado')) {
      cards.push({
        id: 'general-1',
        type: 'general',
        title: 'Estado del Negocio',
        data: {
          totalProducts: 45,
          todayOrders: 23,
          revenue: '$1,245',
          efficiency: '92%',
          status: 'Excelente'
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

      const botResponse = data?.response || 'Lo siento, no pude procesar tu consulta en este momento.';
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

    if (lowerQuestion.includes('inventario') || lowerQuestion.includes('stock')) {
      return 'Basado en el análisis de tu inventario actual, he identificado algunas recomendaciones importantes para optimizar tu stock y reducir desperdicios.';
    }
    
    if (lowerQuestion.includes('ventas') || lowerQuestion.includes('prediccion')) {
      return 'Aquí tienes el análisis de ventas más reciente con predicciones basadas en patrones históricos y tendencias del mercado.';
    }
    
    if (lowerQuestion.includes('visitantes') || lowerQuestion.includes('clientes')) {
      return 'He generado una predicción de visitantes para hoy basada en patrones históricos, día de la semana y factores externos.';
    }
    
    if (lowerQuestion.includes('alerta') || lowerQuestion.includes('vencimiento')) {
      return 'He detectado algunos productos que requieren atención inmediata para evitar desperdicios y maximizar ganancias.';
    }

    return 'He analizado tu consulta y generado información relevante basada en los datos actuales de tu negocio.';
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
                    {card.data.priority === 'high' ? 'Alta' : 'Media'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{card.data.reason}</p>
                <div className="flex justify-between">
                  <span>Actual: {card.data.current}</span>
                  <span className="text-green-600">Rec: {card.data.recommended}</span>
                </div>
                <div className="text-sm text-green-600">Ahorro: {card.data.savings}</div>
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
                  <span>Producto Top:</span>
                  <span className="font-medium">{card.data.topProduct}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Crecimiento:</span>
                  <div className="flex items-center gap-1">
                    {card.data.trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                    <span className={card.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {card.data.salesIncrease}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos:</span>
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
                  <span>Visitantes esperados:</span>
                  <span className="text-2xl font-bold">{card.data.expected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confianza:</span>
                  <span className="text-green-600">{card.data.confidence}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hora pico:</span>
                  <span className="font-medium">{card.data.peakHour}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-500">Factores: </span>
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
                  <div className="text-sm text-gray-500">Productos</div>
                  <div className="font-bold">{card.data.totalProducts}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Órdenes Hoy</div>
                  <div className="font-bold">{card.data.todayOrders}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ingresos</div>
                  <div className="font-bold text-green-600">{card.data.revenue}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Eficiencia</div>
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
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Asistente IA - Pregúntame sobre tu negocio</span>
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
                placeholder="¿Qué quieres saber sobre tu inventario, ventas, visitantes o alertas?"
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
          <Bot className="w-5 h-5" />
          <span className="font-medium">Asistente IA</span>
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
                    <span className="text-sm text-gray-600">Pensando...</span>
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
                placeholder="Pregúntame sobre tu negocio..."
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