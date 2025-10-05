import { useEffect, useState } from 'react';

export const ChatLoadingIndicator = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = ['🌱', '🍃', '♻️'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-left mb-4">
      <div className="inline-block max-w-[85%] p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-pulse">
            {icons[iconIndex]}
          </div>
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
