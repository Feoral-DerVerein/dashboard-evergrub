import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Minimize2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BusinessCard, LoadingCard, type BusinessCardData } from '@/components/chat/BusinessCards';
import { BusinessIntelligenceService } from '@/services/businessIntelligenceService';
import { useTaskList } from '@/hooks/useTaskList';
import TaskList from '@/components/chat/TaskList';
import { useAutoTaskGeneration } from '@/hooks/useAutoTaskGeneration';
import { productService } from '@/services/productService';
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
const ChatBot = ({
  variant = 'floating'
}: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'inline' ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    type: 'bot',
    content: 'Add any potential changes to your to-do list so that you can make the best decisions for your business.',
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Task list hook
  const { tasks, addTask, addProductDecisionTask, completeTask, removeTask, clearCompletedTasks, takeAction } = useTaskList();
  
  // Auto-generate tasks from current inventory
  const [products, setProducts] = useState([]);
  useAutoTaskGeneration({ products });
  
  // Load products for auto task generation
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await productService.getAllProducts();
        console.log('ChatBot: Loaded products for auto tasks:', fetchedProducts.length);
        
        // If no products exist, create some demo products to generate tasks
        if (fetchedProducts.length === 0) {
          console.log('No products found, creating demo products for task generation');
          const demoProducts = [
            {
              id: 999901,
              name: 'Pan Integral',
              category: 'Panadería',
              quantity: 3, // Low stock
              price: 2.50,
              expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expires tomorrow
              description: 'Pan integral artesanal',
              userId: 'demo',
              userid: 'demo'
            },
            {
              id: 999902,
              name: 'Leche Fresca',
              category: 'Lácteos',
              quantity: 2, // Low stock
              price: 1.80,
              expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expires in 2 days
              description: 'Leche fresca de granja',
              userId: 'demo',
              userid: 'demo'
            },
            {
              id: 999903,
              name: 'Yogurt Natural',
              category: 'Lácteos',
              quantity: 15, // Good stock
              price: 3.20,
              expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Expires in 7 days
              description: 'Yogurt natural sin azúcar',
              userId: 'demo',
              userid: 'demo'
            }
          ];
          setProducts(demoProducts as any);
        } else {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Error loading products for auto tasks:', error);
        // Fallback to demo products if there's an error
        const fallbackProducts = [
          {
            id: 999901,
            name: 'Producto Demo',
            category: 'General',
            quantity: 2,
            price: 5.00,
            expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Producto de demostración',
            userId: 'demo',
            userid: 'demo'
          }
        ];
        setProducts(fallbackProducts as any);
      }
    };
    loadProducts();
  }, []);

  // Add a test product decision task on component mount
  useEffect(() => {
    if (tasks.length === 0) {
      const testProduct = {
        id: 1,
        name: 'Manzanas Rojas',
        quantity: 15,
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Frutas',
        price: 3.50,
        image: '/placeholder.svg'
      };
      addProductDecisionTask(testProduct);
    }
  }, [tasks.length, addProductDecisionTask]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const generateInfoCards = async (question: string): Promise<BusinessCardData[]> => {
    return await BusinessIntelligenceService.processQuery(question);
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
      const {
        data,
        error
      } = await supabase.functions.invoke('chatbot-ai-response', {
        body: {
          question: inputValue
        }
      });
      if (error) throw error;
      const botResponse = data?.response || BusinessIntelligenceService.getResponseText(inputValue);
      const cards = await generateInfoCards(inputValue);
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
      const fallbackResponse = 'Add any potential changes to your to-do list so that you can make the best decisions for your business.';
      const cards = await generateInfoCards(inputValue);
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
    return <BusinessCard key={card.id} card={card} onAddToTaskList={addTask} />;
  };
  if (!isOpen && variant === 'floating') {
    return <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50">
        <MessageCircle className="w-6 h-6" />
      </Button>;
  }
  if (variant === 'inline') {
    return (
      <div className="space-y-6">
        <Card className="w-full shadow-lg border-primary/20">
          {!isMinimized && (
            <CardContent className="p-4">
              {/* Input Section */}
              <div className="flex gap-3 mb-4">
                <Input 
                  value={inputValue} 
                  onChange={e => setInputValue(e.target.value)} 
                  placeholder="Ask me about inventory, sales, products nearing expiry, profitability analysis..." 
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()} 
                  disabled={isLoading} 
                  className="flex-1" 
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputValue.trim()} 
                  className="bg-primary hover:bg-primary/90 px-6"
                >
                  {isLoading ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  ) : <Send className="w-4 h-4" />}
                </Button>
              </div>

              {/* Recent Messages - Show last 2 messages only in inline mode */}
              {messages.length > 1 && (
                <div className="space-y-3">
                  {messages.slice(-2).map(message => (
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
                            {message.type === 'bot' ? 'Negentropy Assistant' : 'You'}
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
                        <div 
                          className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left" 
                          style={{ animationDelay: '0.2s' }}
                        >
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
        
        {/* Task List */}
        <TaskList 
          tasks={tasks}
          onCompleteTask={completeTask}
          onRemoveTask={removeTask}
          onClearCompleted={clearCompletedTasks}
          onTakeAction={takeAction}
        />
      </div>
    );
  }

  // Floating version (original design)

  return <div className={`fixed bottom-6 right-6 w-96 bg-card rounded-lg shadow-xl border border-border z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/20 rounded-full">
            <Bot className="w-4 h-4 animate-spin" />
          </div>
          <span className="font-medium">Negentropy Assistant</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-blue-700 h-6 w-6 p-0">
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && <>
          {/* Messages */}
          <ScrollArea className="h-64 p-4">
            {messages.map(message => <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="text-sm">{message.content}</div>
                  {message.type === 'bot' && <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>}
                </div>
                
                {/* Render info cards for bot messages */}
                {message.type === 'bot' && message.cards && message.cards.length > 0 && <div className="mt-3 text-left">
                    {message.cards.map(renderInfoCard)}
                  </div>}
              </div>)}
            {isLoading && <div className="mb-4">
                <div className="inline-block bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Negentropy Assistant está pensando...</span>
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Ask me about your business..." onKeyPress={e => e.key === 'Enter' && handleSendMessage()} disabled={isLoading} />
              <Button onClick={handleSendMessage} size="sm" disabled={isLoading || !inputValue.trim()} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>}
    </div>;
};
export default ChatBot;