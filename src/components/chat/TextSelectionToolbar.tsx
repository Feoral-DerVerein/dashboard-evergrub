import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { StickyNote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface TextSelectionToolbarProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const TextSelectionToolbar = ({ containerRef }: TextSelectionToolbarProps) => {
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && containerRef.current) {
        // Check if selection is within the chat container
        const range = selection?.getRangeAt(0);
        const container = containerRef.current;
        
        if (range && container.contains(range.commonAncestorContainer)) {
          setSelectedText(text);
          
          // Get selection position
          const rect = range.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          setPosition({
            top: rect.top - containerRect.top - 45, // Position above selection
            left: rect.left - containerRect.left + (rect.width / 2) - 80 // Center toolbar
          });
          
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleAddToNotes = async () => {
    if (!user || !selectedText) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          title: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
          content: selectedText,
          tags: ['chatbot'],
          user_id: user.id,
          is_favorite: false
        }]);

      if (error) throw error;

      toast.success('Texto agregado a notas');
      setIsVisible(false);
      
      // Clear selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Error adding to notes:', error);
      toast.error('Error al agregar a notas');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        onClick={handleAddToNotes}
        size="sm"
        className="bg-background border border-border shadow-lg hover:bg-accent hover:text-accent-foreground gap-2 text-sm font-medium"
      >
        <StickyNote className="h-4 w-4" />
        Agregar a notas
      </Button>
    </div>
  );
};
