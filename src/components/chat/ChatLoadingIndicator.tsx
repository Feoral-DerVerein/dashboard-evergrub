import { Loader2 } from 'lucide-react';

export const ChatLoadingIndicator = () => {
  return (
    <div className="text-left mb-4">
      <div className="inline-block max-w-[85%] p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-emerald-700">
              Negentropy is thinking...
            </span>
            <div className="flex gap-1 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
