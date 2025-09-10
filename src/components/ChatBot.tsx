import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Bot,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BusinessCard, LoadingCard, type BusinessCardData } from '@/components/chat/BusinessCards';
import { BusinessIntelligenceService } from '@/services/businessIntelligenceService';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  cards?: BusinessCardData[];
  timestamp: Date;
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
      content: 'G\'day! I\'m your business intelligence assistant. I can help you with queries about inventory, sales, products nearing expiry, profitability analysis, and much more. What would you like to know?',
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

  const generateInfoCards = (question: string): BusinessCardData[] => {
    return BusinessIntelligenceService.processQuery(question);
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

      const botResponse = data?.response || BusinessIntelligenceService.getResponseText(inputValue);
      const cards = generateInfoCards(inputValue);

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
      const fallbackResponse = BusinessIntelligenceService.getResponseText(inputValue);
      const cards = generateInfoCards(inputValue);

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


  const renderInfoCard = (card: BusinessCardData) => {
    return <BusinessCard key={card.id} card={card} />;
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
      <Card className="w-full mb-6 shadow-lg border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">Hello, I'm Negen. How can I help you today?</h3>
              <p className="text-sm text-muted-foreground">What information do you need today?</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
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
                placeholder="Ask me about inventory, sales, products nearing expiry, profitability analysis..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary hover:bg-primary/90 px-6"
              >
                {isLoading ? (
                  <LoadingCard />
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
                    <div className={`inline-block max-w-[80%] p-4 rounded-lg shadow-sm animate-fade-in ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-card text-card-foreground border border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {message.type === 'bot' && <Bot className="w-4 h-4" />}
                        {message.type === 'user' && <User className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {message.type === 'bot' ? 'AI Assistant' : 'You'}
                        </span>
                      </div>
                      <div className="mt-2">{message.content}</div>
                      {message.type === 'bot' && (
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString('en-GB')}
                        </div>
                      )}
                    </div>
                    {/* Render info cards with staggered animation */}
                    {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left"
                           style={{ animationDelay: '0.2s' }}>
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
    <div className={`fixed bottom-6 right-6 w-96 bg-card rounded-lg shadow-xl border border-border z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/20 rounded-full">
            <Bot className="w-4 h-4" />
          </div>
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