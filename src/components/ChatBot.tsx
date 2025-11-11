import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, TrendingUp, DollarSign, Zap, ArrowRight, Bell } from 'lucide-react';
import { BusinessCard, type BusinessCardData } from '@/components/chat/BusinessCards';
import { ProductCards } from '@/components/chat/ProductCards';
import { ProductActionCards } from '@/components/chat/ProductActionCards';
import { InteractiveProductCard } from '@/components/chat/InteractiveProductCard';
import { ActionButtons } from '@/components/chat/ActionButtons';
import { useChatbot } from '@/hooks/useChatbot';
import { useToast } from '@/hooks/use-toast';
import { IntelligentNewsCards } from '@/components/kpi/IntelligentNewsCards';
import { supabase } from '@/integrations/supabase/client';
import { productService, Product } from '@/services/productService';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExpiringProductCard } from '@/components/chat/ExpiringProductCard';
import { NegentropyMenu } from '@/components/chat/NegentropyMenu';
import { ChatFileUploadCard } from '@/components/chat/ChatFileUploadCard';
import aiIcon from '@/assets/ai-icon.png';
interface ChatBotProps {
  variant?: 'floating' | 'inline';
}
const ChatBot = ({
  variant = 'floating'
}: ChatBotProps) => {
  const {
    toast
  } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products for notifications
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productService.getAllProducts();
        setProducts(productsData);

        // Count notifications (expiring products + low stock)
        const expiringProducts = productsData.filter(p => {
          if (!p.expirationDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        });
        const lowStockProducts = productsData.filter(p => p.quantity <= 5 && p.quantity > 0);
        setNotificationCount(expiringProducts.length + lowStockProducts.length);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Auto-focus input on mobile devices
  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);
  const handleProductAction = (action: 'reserve' | 'cart' | 'details', productId: string) => {
    switch (action) {
      case 'reserve':
        toast({
          title: "Reservation Created",
          description: `Product ${productId} has been reserved successfully.`
        });
        break;
      case 'cart':
        toast({
          title: "Added to Cart",
          description: `Product ${productId} has been added to your cart.`
        });
        break;
      case 'details':
        // Details modal is handled in the component
        break;
    }
  };

  // Enhanced chatbot hook with intelligence
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    sendMessage,
    messagesEndRef
  } = useChatbot();
  const renderInfoCard = (card: BusinessCardData) => {
    return <BusinessCard key={card.id} card={card} />;
  };

  // Three column suggestions organized by category
  const suggestionCategories = [{
    icon: <TrendingUp className="w-6 h-6" />,
    title: "AI Predictive Insights",
    suggestions: ["Predict which products will sell best this week", "What will be the demand for vegetables in the next 3 days?", "Analyze purchase patterns of frequent customers"]
  }, {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Savings & Food Waste",
    suggestions: ["How much money have I saved by reducing waste?", "Suggest strategies to reduce food waste", "Calculate the environmental impact of my savings"]
  }, {
    icon: <Zap className="w-6 h-6" />,
    title: "Smart Recommendations",
    suggestions: ["Recommend actions based on my current inventory", "Which products should I put on sale today?", "Optimize my stock for the weekend rush"]
  }];
  const handleNotificationClick = () => {
    // Create a message with smart notifications
    const notificationMessage = {
      id: Date.now().toString(),
      type: 'bot' as const,
      content: 'Here are your smart notifications based on current inventory and orders:',
      smart_notifications: true
    };

    // Add to messages manually to show the cards
    sendMessage('Show me smart notifications');
  };
  if (variant === 'inline') {
    return <div className="w-full bg-white">
        <div className="w-full px-4 py-4">
          {/* Header */}
          <div className="text-center mb-6 mt-2">
            {/* Negentropy Logo with Menu */}
            <div className="flex justify-center mb-4">
              <NegentropyMenu onSuggestionClick={suggestion => {
              setInputValue(suggestion);
              sendMessage(suggestion);
            }} />
            </div>
            
            {/* AI Greeting with notification badge */}
            <div className="relative inline-block">
              
              
              {/* Notification Badge */}
              {notificationCount > 0 && <button onClick={handleNotificationClick} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600 transition-all hover:scale-110 animate-pulse">
                  {notificationCount}
                </button>}
            </div>
          </div>

          {/* File Upload Card - Show when no messages */}
          {messages.length === 0 && (
            <div className="max-w-md mx-auto mb-6">
              <ChatFileUploadCard />
            </div>
          )}

          {/* Messages Display Area (if there are messages) */}
          {messages.length > 0 && <div className="max-w-3xl mx-auto mb-4 space-y-4">
              {messages.map((message, index) => <div key={message.id} className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  
                  {/* Message Content (User or Bot Text) */}
                  {message.content && (
                    <div className="space-y-2">
                      <div className={`inline-block max-w-[80%] px-4 py-3 rounded-2xl mb-3 animate-fade-in ${
                        message.type === 'user' 
                          ? 'bg-[#10a37f] text-white rounded-br-md' 
                          : 'bg-[#f7f7f8] text-[#202123] rounded-bl-md border border-[#d9d9e3]'
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Action Buttons - Only for bot messages */}
                      {message.type === 'bot' && (message as any).actions && (
                        <ActionButtons actions={(message as any).actions} />
                      )}
                    </div>
                  )}
                  
                  {/* Business Cards */}
                  {message.type === 'bot' && message.cards && message.cards.length > 0 && <div className="mt-4 space-y-3 text-left">
                      <p className="text-sm font-medium text-[#6e6e80] px-1">📊 Data Analysis:</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {message.cards.map(card => <div key={card.id}>
                            {renderInfoCard(card)}
                          </div>)}
                      </div>
                    </div>}

                   {/* Product Cards - Use Interactive Product Cards */}
                  {message.type === 'bot' && message.product_cards && message.product_cards.length > 0 && <div className="text-left mt-4">
                      <p className="text-sm font-medium text-gray-700 px-1 mb-4">📦 Available Products:</p>
                      <div className="space-y-3">
                        {message.product_cards.map((product: any) => <InteractiveProductCard key={product.id} product={{
                  id: product.id.toString(),
                  name: product.name || 'Product',
                  category: product.category || 'General',
                  price: product.price || 0,
                  image: product.image_url,
                  location: product.location,
                  pickupTime: product.pickupTime,
                  quantity: product.quantity,
                  urgency: product.urgency,
                  description: product.reason
                }} onAction={handleProductAction} />)}
                      </div>
                    </div>}
                  
                   {/* Smart Notifications */}
                  {message.type === 'bot' && (message as any).smart_notifications && <div className="text-left mt-4">
                      <IntelligentNewsCards products={products} orders={[]} insights={null} />
                    </div>}

                   {/* Expiring Products Cards */}
                  {message.type === 'bot' && (message as any).expiring_products && (message as any).expiring_products.length > 0 && <div className="text-left mt-4">
                      <p className="text-sm font-medium text-gray-700 px-1 mb-4">📦 Products Expiring Soon (&lt;72 hours):</p>
                      <div className="space-y-3">
                        {(message as any).expiring_products.map((product: any) => <ExpiringProductCard key={product.id} product={product} onActionComplete={(productId, action, destination) => {
                  console.log(`Product ${productId} ${action} to ${destination}`);
                }} />)}
                      </div>
                    </div>}
                </div>)}
              
              <div ref={messagesEndRef} />
            </div>}

          {/* Chat Input Section */}
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-white border border-[#d9d9e3] rounded-xl px-4 py-3 flex items-center gap-3 shadow-none">
              <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isLoading && inputValue.trim() && sendMessage()} placeholder="Send a message..." disabled={isLoading} className="flex-1 bg-transparent border-none text-[#202123] text-base outline-none px-2 py-2 placeholder:text-[#6e6e80]" />
              <button onClick={() => sendMessage()} disabled={isLoading || !inputValue.trim()} className="w-9 h-9 bg-[#10a37f] hover:bg-[#0d8c6d] disabled:bg-[#e5e5e5] disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200 text-white">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          
        </div>
      </div>;
  }

  // Floating version remains unchanged for now (can be updated later if needed)
  return null;
};
export default ChatBot;