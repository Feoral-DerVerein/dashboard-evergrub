import { supabase } from "@/integrations/supabase/client";

export const productImageSuggestService = {
  async suggestImage(barcode?: string, name?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('product-image-suggest', {
        body: { barcode, name }
      });
      if (error) {
        console.error('Error invoking product-image-suggest:', error);
        return null;
      }
      return (data as any)?.imageUrl || null;
    } catch (e) {
      console.error('suggestImage error:', e);
      return null;
    }
  }
};
