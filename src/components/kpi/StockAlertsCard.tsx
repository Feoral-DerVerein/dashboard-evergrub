import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/services/productService";

interface StockAlertsCardProps {
  products: Product[];
}

export default function StockAlertsCard({ products }: StockAlertsCardProps) {
  const alerts = products.filter((p) => p.quantity > 0 && p.quantity <= 5).slice(0, 5);

  return (
    <Card className="bg-white backdrop-blur-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-amber-900">Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-amber-700/80">No alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="bg-amber-100/60 p-3 rounded-lg flex items-center justify-between border border-amber-200/50"
              >
                <div>
                  <h4 className="font-medium text-amber-900 text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-amber-700/80">Stock: {item.quantity}</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
