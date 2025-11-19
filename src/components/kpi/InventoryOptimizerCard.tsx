import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface InventoryOptimizerCardProps {
  isLoading?: boolean;
}

const InventoryOptimizerCard = ({ isLoading }: InventoryOptimizerCardProps) => {
  // Fake data for inventory optimization
  const inventoryData = [
    { 
      sku: "PROD-001", 
      currentStock: 45, 
      recommendedStock: 85, 
      riskLevel: "High" as const,
      orderSuggestion: "Order 40 units"
    },
    { 
      sku: "PROD-002", 
      currentStock: 120, 
      recommendedStock: 115, 
      riskLevel: "Low" as const,
      orderSuggestion: "Optimal level"
    },
    { 
      sku: "PROD-003", 
      currentStock: 65, 
      recommendedStock: 90, 
      riskLevel: "Medium" as const,
      orderSuggestion: "Order 25 units"
    },
    { 
      sku: "PROD-004", 
      currentStock: 200, 
      recommendedStock: 150, 
      riskLevel: "Medium" as const,
      orderSuggestion: "Reduce stock"
    },
    { 
      sku: "PROD-005", 
      currentStock: 30, 
      recommendedStock: 100, 
      riskLevel: "High" as const,
      orderSuggestion: "Order 70 units"
    },
  ];

  const getRiskBadgeVariant = (risk: "High" | "Medium" | "Low") => {
    if (risk === "High") return "destructive";
    if (risk === "Medium") return "secondary";
    return "default";
  };

  const getRiskIcon = (risk: "High" | "Medium" | "Low") => {
    if (risk === "High") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (risk === "Medium") return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStockComparison = (current: number, recommended: number) => {
    const diff = ((current - recommended) / recommended) * 100;
    if (Math.abs(diff) < 10) return "text-green-600";
    if (current < recommended) return "text-orange-600";
    return "text-blue-600";
  };

  if (isLoading) {
    return (
      <Card className="apple-card">
        <CardHeader>
          <CardTitle>Optimal Inventory Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle>Optimal Inventory Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inventory Table */}
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold text-right">Current Stock</TableHead>
                <TableHead className="font-semibold text-right">Recommended Stock</TableHead>
                <TableHead className="font-semibold">Risk Level</TableHead>
                <TableHead className="font-semibold">Order Suggestion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell className={`text-right font-medium ${getStockComparison(item.currentStock, item.recommendedStock)}`}>
                    {item.currentStock} units
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.recommendedStock} units
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRiskIcon(item.riskLevel)}
                      <Badge variant={getRiskBadgeVariant(item.riskLevel)}>
                        {item.riskLevel}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.orderSuggestion}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          The optimizer calculates ideal inventory by integrating demand forecasts, supplier lead times, 
          and waste risk projections to maintain optimal stock levels while minimizing holding costs and 
          preventing stockouts.
        </p>
      </CardContent>
    </Card>
  );
};

export default InventoryOptimizerCard;
