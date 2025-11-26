import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { performanceEngineService, InventoryItem } from "@/services/performanceEngineService";
import { useAuth } from "@/context/AuthContext";

interface InventoryOptimizerCardProps {
  isLoading?: boolean;
}

const InventoryOptimizerCard = ({ isLoading: externalLoading }: InventoryOptimizerCardProps) => {
  const { user } = useAuth();
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const data = await performanceEngineService.getInventoryData(user.id);
        setInventoryData(data);
      } catch (error) {
        console.error("Error loading inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const isLoading = externalLoading || loading;

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
              {inventoryData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay productos disponibles para analizar
                  </TableCell>
                </TableRow>
              ) : (
                inventoryData.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.sku}</span>
                        <span className="text-xs text-muted-foreground">{item.productName}</span>
                      </div>
                    </TableCell>
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
                ))
              )}
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
