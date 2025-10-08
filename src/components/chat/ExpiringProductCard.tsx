import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ExpiringProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  expirationDate: string;
  quantity: number;
  daysUntilExpiry: number;
}

interface ExpiringProductCardProps {
  product: ExpiringProduct;
  onActionComplete?: (productId: number, action: string, destination: string) => void;
}

const categoryIcons: Record<string, string> = {
  'dairy': '🥛',
  'bakery': '🍞',
  'meat': '🥩',
  'vegetables': '🥬',
  'fruits': '🍎',
  'beverages': '🥤',
  'default': '📦'
};

export const ExpiringProductCard = ({ product, onActionComplete }: ExpiringProductCardProps) => {
  const [status, setStatus] = useState<'pending' | 'sent'>('pending');
  const [sentTo, setSentTo] = useState<string>('');

  const getCategoryIcon = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    return categoryIcons[normalizedCategory] || categoryIcons['default'];
  };

  const handleMarketplaceAction = async (marketplace: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Call edge function to publish to marketplace
      const { data, error } = await supabase.functions.invoke('publish-to-marketplace', {
        body: {
          product_id: product.id,
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

      if (onActionComplete) {
        onActionComplete(product.id, 'marketplace', marketplace);
      }
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

      // Call edge function to send to donation
      const { data, error } = await supabase.functions.invoke('send-to-donation', {
        body: {
          product_id: product.id,
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

      if (onActionComplete) {
        onActionComplete(product.id, 'donation', organization);
      }
    } catch (error) {
      console.error('Error sending to donation:', error);
      toast.error('⚠️ Error processing donation', {
        description: 'Please try again or contact support'
      });
    }
  };

  const getUrgencyColor = () => {
    if (product.daysUntilExpiry <= 1) return 'border-l-red-500 bg-red-50/50';
    if (product.daysUntilExpiry <= 2) return 'border-l-orange-500 bg-orange-50/50';
    return 'border-l-yellow-500 bg-yellow-50/50';
  };

  return (
    <Card className={`border-l-4 ${getUrgencyColor()} hover:shadow-md transition-all duration-200 ${status === 'sent' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Product Icon/Image */}
          <div className="flex-shrink-0">
            {product.image && product.image !== '' ? (
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                {getCategoryIcon(product.category)}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {getCategoryIcon(product.category)} {product.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                <p className="text-sm font-bold text-foreground mt-1">${product.price}</p>
              </div>

              {/* Actions Button */}
              {status === 'pending' ? (
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
              ) : (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0">
                  <Check className="w-3 h-3" />
                  Sent
                </div>
              )}
            </div>

            {/* Status Badge */}
            {status === 'sent' && sentTo && (
              <div className="mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block">
                ✅ Sent to {sentTo}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
