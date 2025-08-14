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
          <p className="text-sm text-gray-500">No items expiring soon</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const d = daysUntil(item.expirationDate);
              const sev = severityFor(d);
              const bg = sev === "high" ? "bg-red-50" : sev === "medium" ? "bg-yellow-50" : "bg-red-50";
              return (
                <div key={item.id} className={`${bg} p-3 rounded-lg`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Expires in: {Math.max(0, isFinite(d) ? d : 0)} days • Quantity: {item.quantity} units
                      </p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3"
                        onClick={() => console.log(`Add ${item.name} to marketplace`)}
                      >
                        <Store className="w-3 h-3 mr-1" />
                        Marketplace
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3"
                        onClick={() => console.log(`Donate ${item.name}`)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
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
