import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/services/productService";

interface StockAlertsCardProps {
  products: Product[];
}

export default function StockAlertsCard({ products }: StockAlertsCardProps) {
  const alerts = products.filter((p) => p.quantity > 0 && p.quantity <= 5).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-600">Stock: {item.quantity}</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
