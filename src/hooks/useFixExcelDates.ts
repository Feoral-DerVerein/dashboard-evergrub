import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFixExcelDates = () => {
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const fixExcelDates = async () => {
    setIsFixing(true);
    
    try {
      console.log('🔧 Starting Excel date conversion...');
      
      const { data, error } = await supabase.functions.invoke('fix-excel-dates', {
        method: 'POST',
      });

      if (error) {
        console.error('❌ Error fixing dates:', error);
        throw error;
      }

      console.log('✅ Dates fixed successfully:', data);

      toast({
        title: "✅ Fechas convertidas",
        description: `Se convirtieron ${data.convertedCount} fechas de Excel a formato correcto`,
      });

      return data;
    } catch (error) {
      console.error('❌ Error in fixExcelDates:', error);
      
      toast({
        title: "Error al convertir fechas",
        description: error.message || "No se pudieron convertir las fechas",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsFixing(false);
    }
  };

  return {
    fixExcelDates,
    isFixing,
  };
};
