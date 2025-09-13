import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/services/productService";
import { DonationForm } from "@/components/DonationForm";
import { Store, Heart, X } from "lucide-react";
import { useState } from "react";
import { productService } from "@/services/productService";
import { toast } from "sonner";
interface ExpiringSoonCardProps {
  products: Product[];
}
function daysUntil(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date(NaN);
  if (isNaN(d.getTime())) return Infinity;
  return Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}
function severityFor(days: number): "high" | "medium" | "low" {
  if (days <= 3) return "high";
  if (days <= 7) return "medium";
  return "low";
}
export default function ExpiringSoonCard({
  products
}: ExpiringSoonCardProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [donationFormOpen, setDonationFormOpen] = useState(false);
  const [publishingToMarketplace, setPublishingToMarketplace] = useState<number | null>(null);
  const [hiddenItems, setHiddenItems] = useState<Set<number>>(new Set());
  
  const items = products
    .filter(p => daysUntil(p.expirationDate) <= 14 && !hiddenItems.has(p.id))
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
    .slice(0, 5);

  const handleHideItem = (productId: number) => {
    setHiddenItems(prev => new Set([...prev, productId]));
    toast.success("Item removed from expiring soon list");
  };
  const handlePublishToMarketplace = async (product: Product) => {
    try {
      setPublishingToMarketplace(product.id);

      // Update product to be visible in marketplace
      await productService.updateProduct(product.id, {
        ...product,
        isMarketplaceVisible: true
      } as any);
      toast.success("Published to Marketplace!", {
        description: `${product.name} is now visible in WiseBite marketplace`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error publishing to marketplace:", error);
      toast.error("Failed to publish to marketplace");
    } finally {
      setPublishingToMarketplace(null);
    }
  };
  const handleDonateProduct = (product: Product) => {
    setSelectedProduct(product);
    setDonationDialogOpen(true);
  };
  const handleDonationSubmit = () => {
    setDonationDialogOpen(false);
    setDonationFormOpen(true);
  };
  return <>
      <Card className="bg-white overflow-hidden border border-gray-200">
        <CardHeader className="pb-3 bg-gradient-to-r from-background to-muted/30">
          <CardTitle className="text-base font-bold text-foreground">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {items.length === 0 ? <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No items expiring soon</p>
            </div> : <div className="space-y-2">
              {items.map(item => {
            const d = daysUntil(item.expirationDate);
            const sev = severityFor(d);
            const urgencyColor = sev === "high" ? "text-red-600" : sev === "medium" ? "text-yellow-600" : "text-gray-600";
            const urgencyBg = sev === "high" ? "bg-red-50 border-red-200" : sev === "medium" ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200";
            return <div 
                key={item.id} 
                className="bg-white border rounded-lg p-3 transition-all duration-200 hover:shadow-sm group relative"
              >
                {/* X button to remove item */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHideItem(item.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                <div className="space-y-2">
                  {/* Product Name and Info */}
                  <div className="pr-6">
                    <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${urgencyBg} ${urgencyColor}`}>
                        {Math.max(0, isFinite(d) ? d : 0)} days
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} units
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Horizontal layout, smaller */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs font-medium bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishToMarketplace(item);
                      }} 
                      disabled={publishingToMarketplace === item.id}
                    >
                      <Store className="w-3 h-3 mr-1" />
                      {publishingToMarketplace === item.id ? "..." : "Market"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs font-medium bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonateProduct(item);
                      }}
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Donate
                    </Button>
                  </div>
                </div>
              </div>;
          })}
            </div>}
        </CardContent>
      </Card>

      {/* Food Bank Selection Dialog */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Food Bank for Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleDonationSubmit}>
              <Heart className="w-4 h-4 mr-2" />
              Local Food Bank - Central District
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDonationSubmit}>
              <Heart className="w-4 h-4 mr-2" />
              Community Kitchen - North Area
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDonationSubmit}>
              <Heart className="w-4 h-4 mr-2" />
              Salvation Army - Downtown
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Donation Form Dialog */}
      <Dialog open={donationFormOpen} onOpenChange={setDonationFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Donation</DialogTitle>
          </DialogHeader>
          <DonationForm onClose={() => setDonationFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>;
}