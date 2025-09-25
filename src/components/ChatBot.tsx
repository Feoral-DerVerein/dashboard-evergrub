import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Minimize2, Bot, User, Sparkles } from 'lucide-react';
import { BusinessCard, type BusinessCardData } from '@/components/chat/BusinessCards';
import { useTaskList } from '@/hooks/useTaskList';
import TaskList from '@/components/chat/TaskList';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatMessage } from '@/types/chatbot.types';

interface ChatBotProps {
  variant?: 'floating' | 'inline';
}

const ChatBot = ({
  variant = 'floating'
}: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(variant === 'inline' ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Task list hook
  const { tasks, addTask, completeTask, removeTask, archiveTask, clearCompletedTasks, takeAction } = useTaskList();
  
  // Enhanced chatbot hook with intelligence
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    isLoading, 
    isTyping,
    sendMessage, 
    quickSuggestions,
    messagesEndRef 
  } = useChatbot();

  const renderInfoCard = (card: BusinessCardData) => {
    return <BusinessCard key={card.id} card={card} onAddToTaskList={addTask} />;
  };

  // Enhanced suggestion cards with real analytics
  const SuggestionCard = ({ suggestion, onClick }: { suggestion: string; onClick: () => void }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="text-xs px-3 py-2 h-auto whitespace-nowrap bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 animate-fade-in"
    >
      <Sparkles className="w-3 h-3 mr-1" />
      {suggestion}
    </Button>
  );

  const TypingIndicator = () => (
    <div className="flex items-center gap-2 p-3 bg-card rounded-lg border animate-fade-in">
      <Bot className="w-4 h-4 text-primary" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
      <span className="text-sm text-muted-foreground">Negentropy is analyzing...</span>
    </div>
  );

  if (!isOpen && variant === 'floating') {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl z-50 transform hover:scale-105 transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 animate-pulse" />
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="space-y-6">
        <Card className="w-full shadow-lg border-primary/20 bg-gradient-to-br from-card to-card/50">
          {!isMinimized && (
            <CardContent className="p-6">
              {/* Input Section */}
              <div className="flex gap-3 mb-4">
                <Input 
                  value={inputValue} 
                  onChange={e => setInputValue(e.target.value)} 
                  placeholder="Ask me about expiring products, sales, inventory, environmental reports..." 
                  onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                  disabled={isLoading} 
                  className="flex-1 bg-gradient-to-r from-background to-card border-primary/20 focus:border-primary/40 transition-all duration-200" 
                />
                <Button 
                  onClick={() => sendMessage()} 
                  disabled={isLoading || !inputValue.trim()} 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-6 transform hover:scale-105 transition-all duration-200"
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

              {/* Enhanced Suggestion Cards */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      onClick={() => sendMessage(suggestion)}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Messages Display */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(-3).map((message, index) => (
                  <div key={message.id} className={`${message.type === 'user' ? 'text-right' : ''} animate-fade-in`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground ml-auto transform hover:scale-[1.02]' 
                        : 'bg-gradient-to-r from-card to-card/80 text-card-foreground border border-primary/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === 'bot' && <Bot className="w-5 h-5 text-primary animate-pulse" />}
                        {message.type === 'user' && <User className="w-5 h-5 opacity-90" />}
                        <span className="text-sm font-semibold">
                          {message.type === 'bot' ? 'Negentropy AI' : 'You'}
                        </span>
                        <span className="text-xs opacity-60 ml-auto">
                          {message.timestamp.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="leading-relaxed">{message.content}</div>
                    </div>
                    
                    {/* Enhanced Business Cards */}
                    {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
                        {message.cards.map((card, cardIndex) => (
                          <div 
                            key={card.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${(index * 100) + (cardIndex * 50)}ms` }}
                          >
                            {renderInfoCard(card)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Enhanced Typing Indicator */}
                {isTyping && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Task List */}
        <TaskList 
          tasks={tasks}
          onCompleteTask={completeTask}
          onRemoveTask={removeTask}
          onArchiveTask={archiveTask}
          onClearCompleted={clearCompletedTasks}
          onTakeAction={takeAction}
        />
      </div>
    );
  }

  // Enhanced Floating version
  return (
    <div className={`fixed bottom-6 right-6 w-[420px] bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-2xl border border-primary/20 z-50 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold">Negentropy AI</span>
            <div className="text-xs opacity-80">Anti-Waste Assistant</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Enhanced Messages */}
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className={`${message.type === 'user' ? 'text-right' : ''} animate-fade-in`} style={{animationDelay: `${index * 100}ms`}}>
                  <div className={`inline-block max-w-[85%] p-3 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground ml-auto' 
                      : 'bg-gradient-to-r from-background to-card border border-primary/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === 'bot' && <Bot className="w-4 h-4 text-primary" />}
                      {message.type === 'user' && <User className="w-4 h-4" />}
                       <span className="text-sm font-medium">
                         {message.type === 'bot' ? 'AI' : 'You'}
                       </span>
                       <span className="text-xs opacity-60 ml-auto">
                         {message.timestamp.toLocaleTimeString('en-US', { 
                           hour: '2-digit', 
                           minute: '2-digit' 
                         })}
                       </span>
                    </div>
                    <div className="text-sm leading-relaxed">{message.content}</div>
                  </div>
                  
                  {/* Business Cards */}
                  {message.type === 'bot' && message.cards && message.cards.length > 0 && (
                    <div className="mt-3 space-y-2 text-left">
                      {message.cards.map(renderInfoCard)}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Enhanced Input */}
          <div className="p-4 border-t border-primary/20 bg-background rounded-b-2xl">
            <div className="flex gap-2 mb-2">
              <Input 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                placeholder="Ask about inventory, sales, reports..." 
                onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                disabled={isLoading}
                className="bg-gradient-to-r from-background to-card border-primary/20 focus:border-primary/40"
              />
              <Button 
                onClick={() => sendMessage()} 
                size="sm" 
                disabled={isLoading || !inputValue.trim()} 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs px-2 py-1 h-auto bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all duration-200"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;