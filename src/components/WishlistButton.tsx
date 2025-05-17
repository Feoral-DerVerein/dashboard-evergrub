
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: number;
  productData: any;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

const WishlistButton = ({ 
  productId, 
  productData, 
  variant = 'outline', 
  size = 'icon',
  showText = false,
  className = ''
}: WishlistButtonProps) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const inWishlist = await wishlistService.isInWishlist(productId);
      setIsInWishlist(inWishlist);
      setIsLoading(false);
    };

    checkWishlistStatus();
  }, [productId, user]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please log in to add items to wishlist");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(productId, productData);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${isInWishlist ? 'text-red-500' : ''}`}
      onClick={handleWishlistToggle}
      disabled={isLoading}
    >
      <Heart className={`${isInWishlist ? 'fill-red-500' : ''}`} />
      {showText && (
        <span className="ml-2">{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
      )}
    </Button>
  );
};

export default WishlistButton;
