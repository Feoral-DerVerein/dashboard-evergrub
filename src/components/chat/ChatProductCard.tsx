import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export interface ProductData {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    expiryDate: string;
    stock: number;
    imageUrl?: string;
    discount: number;
}

interface ChatProductCardProps {
    product: ProductData;
    onAction?: (action: string) => void;
}

export function ChatProductCard({ product, onAction }: ChatProductCardProps) {
    return (
        <Card className="w-64 shadow-md bg-white border-gray-200 overflow-hidden my-2">
            <div className="h-32 bg-gray-100 relative">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
                {product.discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        -{product.discount}%
                    </Badge>
                )}
            </div>
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-semibold truncate">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-green-600">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="line-through text-gray-400">${product.originalPrice.toFixed(2)}</span>
                    )}
                </div>
                <div className="flex justify-between">
                    <span>Stock: {product.stock}</span>
                    <span className={new Date(product.expiryDate) < new Date() ? "text-red-500 font-bold" : "text-gray-500"}>
                        Exp: {new Date(product.expiryDate).toLocaleDateString()}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-3 pt-0">
                <Button size="sm" className="w-full h-8 text-xs" onClick={() => onAction?.('add_to_cart')}>
                    <ShoppingCart className="w-3 h-3 mr-1" /> Add to Proposal
                </Button>
            </CardFooter>
        </Card>
    );
}
