import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ChatSuggestionCardsProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  'Expiring Products',
  'Current Inventory',
  'Top Wasted Products',
  'Daily/Weekly/Monthly Sales',
  'Best-Selling Products',
  'Profitability Analysis',
  'Sales Predictions',
  'Discount Suggestions'
];

export const ChatSuggestionCards = ({ onSuggestionClick }: ChatSuggestionCardsProps) => {
  return (
    <div className="mt-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="glass-card-suggestion flex-shrink-0 px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};