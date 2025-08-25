import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { Product } from '@/types/product.types';

export const useSurpriseBags = () => {
  const [surpriseBags, setSurpriseBags] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurpriseBags = async () => {
    try {
      setIsLoading(true);
      const allProducts = await productService.getAllProducts();
      const surpriseBagProducts = allProducts.filter(
        product => product.isSurpriseBag && product.isMarketplaceVisible
      );
      setSurpriseBags(surpriseBagProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch surprise bags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurpriseBags();
  }, []);

  return {
    surpriseBags,
    surpriseBagCount: surpriseBags.length,
    isLoading,
    error,
    refetch: fetchSurpriseBags
  };
};