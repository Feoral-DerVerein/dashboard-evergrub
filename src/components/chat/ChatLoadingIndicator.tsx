import thinkingLight from '@/assets/thinking-light.gif';

export const ChatLoadingIndicator = () => {
  return (
    <div className="text-left mb-4">
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background/80 border border-border/40">
        <img 
          src={thinkingLight} 
          alt="Thinking" 
          className="w-9 h-9 object-contain"
        />
        <span className="text-sm font-medium text-foreground">
          Thinking...
        </span>
      </div>
    </div>
  );
};
