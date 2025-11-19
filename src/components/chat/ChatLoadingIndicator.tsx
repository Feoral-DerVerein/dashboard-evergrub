import { Search } from 'lucide-react';

export const ChatLoadingIndicator = () => {
  return (
    <div className="text-left mb-4">
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background/80 border border-border/40">
        <Search className="w-5 h-5 text-muted-foreground animate-pulse" />
        <span className="text-sm font-medium text-foreground">
          Analizando...
        </span>
      </div>
    </div>
  );
};
