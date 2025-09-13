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
        <CardHeader className="pb-4 bg-gradient-to-r from-background to-muted/30">
          <CardTitle className="text-lg font-bold text-foreground">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {items.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">No items expiring soon</p>
            </div> : <div className="space-y-4">
              {items.map(item => {
            const d = daysUntil(item.expirationDate);
            const sev = severityFor(d);
            const bgGradient = sev === "high" ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200 dark:from-red-950/30 dark:to-red-900/20 dark:border-red-800" : sev === "medium" ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/30 dark:to-yellow-900/20 dark:border-yellow-800" : "bg-gradient-to-r from-muted/30 to-muted/50 border-border";
            const urgencyColor = sev === "high" ? "text-red-700 dark:text-red-400" : sev === "medium" ? "text-yellow-700 dark:text-yellow-400" : "text-muted-foreground";
            const urgencyBg = sev === "high" ? "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800" : sev === "medium" ? "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" : "bg-muted border-border";
            return <div 
                key={item.id} 
                className={`${bgGradient} border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group relative`}
              >
                {/* X button to remove item */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHideItem(item.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                    <div className="flex items-start justify-between gap-4">
                      {/* Product Info - Takes more space */}
                      <div className="flex-1 min-w-0 space-y-2 pr-8">
                        <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">{item.name}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${urgencyBg}`}>
                            
                            <span className={urgencyColor}>
                              {Math.max(0, isFinite(d) ? d : 0)} days left
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs bg-background/60 px-2.5 py-1 rounded-full border">
                            {item.quantity} units
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Stacked vertically and smaller */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:shadow-sm hover:scale-105 transition-all duration-200 group/btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishToMarketplace(item);
                          }} 
                          disabled={publishingToMarketplace === item.id}
                        >
                          <Store className="w-3 h-3 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                          {publishingToMarketplace === item.id ? "Publishing..." : "Marketplace"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-sm hover:scale-105 transition-all duration-200 group/btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDonateProduct(item);
                          }}
                        >
                          <Heart className="w-3 h-3 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                          Donation
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