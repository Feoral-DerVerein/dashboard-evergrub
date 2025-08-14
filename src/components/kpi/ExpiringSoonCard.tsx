import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/productService";
import { Store, Heart } from "lucide-react";

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

export default function ExpiringSoonCard({ products }: ExpiringSoonCardProps) {
  const items = products
    .filter((p) => daysUntil(p.expirationDate) <= 14)
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Expiring Soon</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No items expiring soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const d = daysUntil(item.expirationDate);
              const sev = severityFor(d);
              const bgColor = sev === "high" ? "bg-destructive/10 border-destructive/20" : 
                             sev === "medium" ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800" : 
                             "bg-muted/50 border-border";
              const urgencyColor = sev === "high" ? "text-destructive" : 
                                  sev === "medium" ? "text-yellow-600 dark:text-yellow-400" : 
                                  "text-muted-foreground";
              
              return (
                <div key={item.id} className={`${bgColor} border rounded-lg p-4 transition-all hover:shadow-sm`}>
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${urgencyColor}`}>
                          {Math.max(0, isFinite(d) ? d : 0)} days remaining
                        </span>
                        <span className="text-muted-foreground">
                          {item.quantity} units
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-9"
                        onClick={() => console.log(`Add ${item.name} to marketplace`)}
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Marketplace
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-9"
                        onClick={() => console.log(`Donate ${item.name}`)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Donation
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
