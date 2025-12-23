import React, { useState } from 'react';
import { AlertTriangle, Heart, ShoppingBag, DollarSign, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DonationDialog } from './DonationDialog';

// Demo product data
const DEMO_PRODUCT = {
    id: 'demo-001',
    name: 'Croissants de Mantequilla (Pack 6)',
    supplier: 'Hornos Artesanos S.L.',
    category: 'Bakery',
    stock: 12,
    price: 4.50,
    expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    barcode: '8412345678901',
};

export default function DemoProductCard() {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

    const handleDonateClick = () => {
        setIsDonationDialogOpen(true);
    };

    const handleMarketplaceClick = async () => {
        setIsProcessing('marketplace');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Publicado en Marketplace', {
            description: 'Disponible ahora en Too Good To Go y Wisebite.',
            duration: 5000,
        });

        setIsProcessing(null);
    };

    const getDaysUntilExpiration = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntilExpiration(DEMO_PRODUCT.expiration_date);

    return (
        <>
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 border-yellow-500 bg-white dark:bg-card shadow-lg">
                {/* Expiration Alert Header - matches InventoryProductCard */}
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <Badge variant="default" className="animate-pulse">
                            ⚠️ Próximo a expirar
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                    {/* Product Info - matches InventoryProductCard */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground line-clamp-2">
                                {DEMO_PRODUCT.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{DEMO_PRODUCT.category}</p>
                        </div>
                        <Package className="w-5 h-5 text-primary ml-2" />
                    </div>

                    {/* Stats Row - matches InventoryProductCard */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-lg text-green-600">€{DEMO_PRODUCT.price.toFixed(2)}</span>
                            </div>
                            <Badge variant="secondary">
                                <Package className="w-3 h-3 mr-1" />
                                Stock: {DEMO_PRODUCT.stock}
                            </Badge>
                        </div>
                        {/* Expiration badge below stock */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="secondary">
                                {daysLeft} días restantes
                            </Badge>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                            variant="default"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleDonateClick}
                            disabled={isProcessing !== null}
                        >
                            <Heart className="w-4 h-4 mr-2" />
                            Donar
                        </Button>
                        <Button
                            variant="default"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={handleMarketplaceClick}
                            disabled={isProcessing !== null}
                        >
                            {isProcessing === 'marketplace' ? (
                                <span className="animate-spin mr-2">⏳</span>
                            ) : (
                                <ShoppingBag className="w-4 h-4 mr-2" />
                            )}
                            Marketplace
                        </Button>
                    </div>

                    {/* Metadata */}
                    <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                        <p>📦 Proveedor: {DEMO_PRODUCT.supplier}</p>
                        <p>🔢 Código: {DEMO_PRODUCT.barcode}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Donation Dialog - outside Card to prevent event propagation */}
            <DonationDialog
                open={isDonationDialogOpen}
                onOpenChange={setIsDonationDialogOpen}
                product={{
                    id: DEMO_PRODUCT.id,
                    name: DEMO_PRODUCT.name,
                    category: DEMO_PRODUCT.category,
                    stock: DEMO_PRODUCT.stock,
                    price: DEMO_PRODUCT.price,
                    expirationDate: DEMO_PRODUCT.expiration_date,
                }}
            />
        </>
    );
}


