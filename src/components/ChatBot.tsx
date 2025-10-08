import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, TrendingUp, DollarSign, Zap, ArrowRight } from 'lucide-react';
import { BusinessCard, type BusinessCardData } from '@/components/chat/BusinessCards';
import { ProductCards } from '@/components/chat/ProductCards';
import { ProductActionCards } from '@/components/chat/ProductActionCards';
import { InteractiveProductCard } from '@/components/chat/InteractiveProductCard';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatLoadingIndicator } from '@/components/chat/ChatLoadingIndicator';
import { useToast } from '@/hooks/use-toast';

interface ChatBotProps {
  variant?: 'floating' | 'inline';
}

const ChatBot = ({
  variant = 'floating'
}: ChatBotProps) => {
  const { toast } = useToast();

  const handleProductAction = (action: 'reserve' | 'cart' | 'details', productId: string) => {
    switch (action) {
      case 'reserve':
        toast({
          title: "Reservation Created",
          description: `Product ${productId} has been reserved successfully.`,
        });
        break;
      case 'cart':
        toast({
          title: "Added to Cart",
          description: `Product ${productId} has been added to your cart.`,
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
  const suggestionCategories = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "AI Predictive Insights",
      suggestions: [
        "Predict which products will sell best this week",
        "What will be the demand for vegetables in the next 3 days?",
        "Analyze purchase patterns of frequent customers"
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Savings & Food Waste",
      suggestions: [
        "How much money have I saved by reducing waste?",
        "Suggest strategies to reduce food waste",
        "Calculate the environmental impact of my savings"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Recommendations",
      suggestions: [
        "Recommend actions based on my current inventory",
        "Which products should I put on sale today?",
        "Optimize my stock for the weekend rush"
      ]
    }
  ];

  if (variant === 'inline') {
    return (
      <div className="w-full bg-white min-h-screen">
        <div className="w-full px-4 py-8">
          {/* Header */}
          <div className="text-center mb-16 mt-8">
            <img 
              src="/lovable-uploads/negentropy-logo.png" 
              alt="Negentropy" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-medium text-[#202123] mb-2 leading-relaxed">
              Hi Mate, What are we going to make possible today?
            </h1>
          </div>

          {/* Three columns grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
            {suggestionCategories.map((category, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Icon */}
                <div className="w-12 h-12 mb-5 flex items-center justify-center text-[#202123]">
                  {category.icon}
                </div>
                
                {/* Title */}
                <h2 className="text-xl font-medium text-[#202123] mb-6 text-center">
                  {category.title}
                </h2>
                
                {/* Example cards */}
                <div className="w-full space-y-2">
                  {category.suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => sendMessage(suggestion)}
                      className="w-full bg-[#f7f7f8] hover:bg-[#ececec] border border-[#e5e5e5] hover:border-[#d1d1d1] rounded-lg px-5 py-4 text-sm text-[#202123] text-center transition-all duration-200 cursor-pointer leading-relaxed shadow-none"
                    >
                      {suggestion}
                      <span className="ml-2 text-xs opacity-70">→</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Messages Display Area (if there are messages) */}
          {messages.length > 0 && (
            <div className="max-w-3xl mx-auto mb-8 space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[85%] p-4 rounded-xl ${
                    message.type === 'user' 
                      ? 'bg-[#10a37f] text-white' 
                      : 'bg-[#f7f7f8] text-[#202123] border border-[#e5e5e5]'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {message.type === 'bot' ? 'AI' : 'You'}
                    </div>
                    <div className="leading-relaxed">{message.content}</div>
                  </div>
                  
                  {/* Business Cards */}
                  {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                    <div className="mt-4 space-y-3 text-left">
                      <p className="text-sm font-medium text-[#6e6e80] px-1">📊 Data Analysis:</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {message.cards.map((card) => (
                          <div key={card.id}>
                            {renderInfoCard(card)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Cards - Use Interactive Product Cards */}
                  {message.type === 'bot' && message.product_cards && message.product_cards.length > 0 && (
                    <div className="text-left mt-4">
                      <p className="text-sm font-medium text-[#6e6e80] px-1 mb-3">📦 Available Products:</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {message.product_cards.map((product: any) => (
                          <InteractiveProductCard
                            key={product.id}
                            product={{
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
                            }}
                            onAction={handleProductAction}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && <ChatLoadingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input Section */}
          <div className="max-w-3xl mx-auto mt-10">
            <div className="bg-white border border-[#d9d9e3] rounded-xl px-4 py-3 flex items-center gap-3 shadow-none">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isLoading && inputValue.trim() && sendMessage()}
                placeholder="Send a message..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-[#202123] text-base outline-none px-2 py-2 placeholder:text-[#6e6e80]"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 bg-[#10a37f] hover:bg-[#0d8c6d] disabled:bg-[#e5e5e5] disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200 text-white"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-[#6e6e80] text-sm px-5 py-4">
            AI Insights Chat - Powered by Advanced Machine Learning. Your data helps us improve.
          </div>
        </div>
      </div>
    );
  }

  // Floating version remains unchanged for now (can be updated later if needed)
  return null;
};

export default ChatBot;