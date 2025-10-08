import { 
  Package,
  Apple,
  Cookie,
  Coffee,
  Beef,
  Fish,
  Milk,
  Carrot,
  Salad,
  Pizza,
  Sandwich,
  IceCream,
  Wine,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface ProductCardData {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  location?: string;
  pickupTime?: string;
  quantity?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface InteractiveProductCardProps {
  product: ProductCardData;
  onAction?: (action: 'reserve' | 'cart' | 'details', productId: string) => void;
}

export function InteractiveProductCard({ product, onAction }: InteractiveProductCardProps) {
  const [status, setStatus] = useState<'pending' | 'sent'>('pending');
  const [sentTo, setSentTo] = useState<string>('');
  
  const urgencyColors = {
    low: 'bg-green-50 text-green-700',
    medium: 'bg-yellow-50 text-yellow-700',
    high: 'bg-orange-50 text-orange-700',
    critical: 'bg-red-50 text-red-700'
  };

  const handleMarketplaceAction = async (marketplace: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('publish-to-marketplace', {
        body: {
          product_id: parseInt(product.id),
          marketplace_name: marketplace,
          user_id: user.id
        }
      });

      if (error) throw error;

      setStatus('sent');
      setSentTo(marketplace);
      toast.success(`✅ ${product.name} sent to ${marketplace}`, {
        description: 'Product successfully published to marketplace'
      });
    } catch (error) {
      console.error('Error publishing to marketplace:', error);
      toast.error('⚠️ Error publishing product', {
        description: 'Please try again or contact support'
      });
    }
  };

  const handleDonationAction = async (organization: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-to-donation', {
        body: {
          product_id: parseInt(product.id),
          organization_name: organization,
          user_id: user.id
        }
      });

      if (error) throw error;

      setStatus('sent');
      setSentTo(organization);
      toast.success(`✅ ${product.name} sent to ${organization}`, {
        description: 'Donation request submitted successfully'
      });
    } catch (error) {
      console.error('Error sending to donation:', error);
      toast.error('⚠️ Error processing donation', {
        description: 'Please try again or contact support'
      });
    }
  };

  // Get icon based on category
  const getCategoryIcon = () => {
    const category = product.category.toLowerCase();
    const iconProps = { className: "w-6 h-6 text-gray-500" };
    
    if (category.includes('fruit') || category.includes('apple')) return <Apple {...iconProps} />;
    if (category.includes('pastries') || category.includes('bakery') || category.includes('bread')) return <Cookie {...iconProps} />;
    if (category.includes('coffee') || category.includes('beverage')) return <Coffee {...iconProps} />;
    if (category.includes('meat') || category.includes('beef') || category.includes('pork')) return <Beef {...iconProps} />;
    if (category.includes('fish') || category.includes('seafood')) return <Fish {...iconProps} />;
    if (category.includes('dairy') || category.includes('milk') || category.includes('cheese')) return <Milk {...iconProps} />;
    if (category.includes('vegetable') || category.includes('veggie')) return <Carrot {...iconProps} />;
    if (category.includes('salad') || category.includes('greens')) return <Salad {...iconProps} />;
    if (category.includes('pizza')) return <Pizza {...iconProps} />;
    if (category.includes('sandwich') || category.includes('deli')) return <Sandwich {...iconProps} />;
    if (category.includes('dessert') || category.includes('ice cream')) return <IceCream {...iconProps} />;
    if (category.includes('wine') || category.includes('alcohol')) return <Wine {...iconProps} />;
    
    return <Package {...iconProps} />;
  };

  return (
    <div className={`bg-white rounded-2xl p-4 hover:shadow-md transition-shadow ${status === 'sent' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
          {getCategoryIcon()}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          {product.urgency && (
            <Badge 
              className={`${urgencyColors[product.urgency]} px-2 py-0.5 rounded-full text-xs font-medium border-0 inline-block mb-1`}
            >
              {product.urgency}
            </Badge>
          )}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-gray-900 text-base">Product</span>
            <span className="text-gray-600 text-sm">{product.category}</span>
          </div>
          
          {/* Status Badge */}
          {status === 'sent' && sentTo && (
            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
              ✅ Sent to {sentTo}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-emerald-500 font-bold text-xl flex-shrink-0">
          ${product.price.toFixed(2)}
        </div>

        {/* Actions Button */}
        {status === 'pending' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="flex-shrink-0">
                Actions <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Marketplace Menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  📱 Marketplace
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleMarketplaceAction('Doordash')}>
                    Doordash
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarketplaceAction('TooGoodToGo')}>
                    TooGoodToGo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarketplaceAction('UberEats')}>
                    UberEats
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarketplaceAction('Yume')}>
                    Yume
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Donation Menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  ❤️ Donation
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleDonationAction('Oz Harvest')}>
                    Oz Harvest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDonationAction('Food Bank')}>
                    Food Bank
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDonationAction('SecondBite')}>
                    SecondBite
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
