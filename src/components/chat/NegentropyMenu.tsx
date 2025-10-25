import { useState, useEffect } from 'react';
import { Sun, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import jniLogo from '@/assets/jni-logo.png';

// Inline styles for smooth animation
const smoothSlideAnimation = `
  @keyframes slideInSmooth {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

interface MenuCategory {
  icon: React.ReactNode;
  title: string;
  suggestions: string[];
}

interface NegentropyMenuProps {
  onSuggestionClick: (suggestion: string) => void;
}

const menuCategories: MenuCategory[] = [
  {
    icon: <Sun className="w-6 h-6" />,
    title: "Examples",
    suggestions: [
      "Explain quantum computing in simple terms",
      "Got any creative ideas for a 10 year old's birthday?",
      "How do I make a HTTP request in Javascript?"
    ]
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Capabilities",
    suggestions: [
      "Remembers what user said earlier in the conversation",
      "Allows user to provide follow-up corrections",
      "Trained to decline inappropriate requests"
    ]
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Limitations",
    suggestions: [
      "May occasionally generate incorrect information",
      "May occasionally produce harmful instructions or biased content",
      "Limited knowledge of world and events after 2021"
    ]
  }
];

export const NegentropyMenu = ({ onSuggestionClick }: NegentropyMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Inject animation styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = smoothSlideAnimation;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center min-h-[80px]">
      {/* Logo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 transition-transform duration-300 hover:scale-110 active:scale-95 bg-white rounded-lg p-2 shadow-sm"
      >
        <img 
          src={jniLogo} 
          alt="JNI Logo" 
          className="h-16 w-auto object-contain"
        />
      </button>

      {/* Expanded Menu */}
      {isOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 flex items-center gap-4 z-10">
          {/* Spacer for logo */}
          <div className="w-16" />
          
          {/* Menu Categories */}
          {menuCategories.map((category, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Icon Button */}
              <div
                className="w-16 h-16 rounded-full bg-[#343541] flex items-center justify-center text-white shadow-lg transition-all duration-500 hover:scale-110 cursor-pointer"
                style={{ 
                  animation: 'slideInSmooth 0.8s ease-out forwards',
                  animationDelay: `${index * 200}ms`,
                  opacity: 0,
                  transform: 'translateX(-20px)'
                }}
              >
                {category.icon}
              </div>

              {/* Suggestions Card */}
              {hoveredCategory === index && (
                <div 
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-80 bg-[#343541] rounded-lg shadow-2xl p-4 animate-fade-in z-30"
                >
                  <h3 className="text-white font-semibold text-sm mb-3">{category.title}</h3>
                  <div className="space-y-2">
                    {category.suggestions.map((suggestion, suggestionIndex) => (
                      <button
                        key={suggestionIndex}
                        onClick={() => {
                          onSuggestionClick(suggestion);
                          setIsOpen(false);
                        }}
                        className="w-full text-left bg-[#40414f] hover:bg-[#4a4b5a] text-white/90 text-sm rounded-lg px-4 py-3 transition-all duration-200 flex items-center gap-2 group"
                      >
                        <span className="flex-1">{suggestion}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
