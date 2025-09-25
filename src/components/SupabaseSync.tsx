import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupabaseSyncProps {
  onProductChange?: () => void;
}

export const SupabaseSync = ({ onProductChange }: SupabaseSyncProps) => {
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔄 Setting up Supabase real-time sync for dashboard");
    
    // Listen to changes in products table for real-time sync
    const channel = supabase
      .channel('dashboard-products-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('🔄 Dashboard detected product change:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "🆕 Product Added",
              description: `New product synchronized from Supabase`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "📝 Product Updated", 
              description: `Product changes synchronized from Supabase`,
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "🗑️ Product Removed",
              description: `Product removed and synchronized`,
            });
          }
          
          // Trigger refresh if callback provided
          onProductChange?.();
        }
      )
      .subscribe((status) => {
        console.log('📡 Supabase sync status:', status);
      });

    return () => {
      console.log("🔌 Cleaning up Supabase sync");
      supabase.removeChannel(channel);
    };
  }, [toast, onProductChange]);

  return null; // This component doesn't render anything, just handles sync
};