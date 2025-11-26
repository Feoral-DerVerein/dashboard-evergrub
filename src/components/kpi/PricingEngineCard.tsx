import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { performanceEngineService, PricingItem } from "@/services/performanceEngineService";
import { useAuth } from "@/context/AuthContext";

interface PricingEngineCardProps {
  isLoading?: boolean;
}

const PricingEngineCard = ({ isLoading: externalLoading }: PricingEngineCardProps) => {
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const data = await performanceEngineService.getPricingData(user.id);
        setPricingData(data);
      } catch (error) {
        console.error("Error loading pricing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const isLoading = externalLoading || loading;

  const getPriceIcon = (direction: "up" | "down" | "neutral") => {
    if (direction === "up") return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (direction === "down") return <ArrowDown className="h-3 w-3 text-orange-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact.startsWith("+")) return "text-green-600";
    if (impact.startsWith("-")) return "text-orange-600";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Card className="apple-card">
        <CardHeader>
          <CardTitle>Optimal Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle>Optimal Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Table */}
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold text-right">Current Price</TableHead>
                <TableHead className="font-semibold text-right">Recommended Price</TableHead>
                <TableHead className="font-semibold text-right">Margin Impact</TableHead>
                <TableHead className="font-semibold text-right">Demand Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay productos disponibles para analizar
                  </TableCell>
                </TableRow>
              ) : (
                pricingData.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.sku}</span>
                        <span className="text-xs text-muted-foreground">{item.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getPriceIcon(item.direction)}
                        <span className="font-medium">${item.recommendedPrice.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getImpactColor(item.marginImpact)}`}>
                      {item.marginImpact}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getImpactColor(item.demandImpact)}`}>
                      {item.demandImpact}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          The system calculates optimal pricing based on current demand patterns, projected waste reduction, 
          product elasticity, competitor pricing, and inventory turnover rates to maximize both revenue and 
          reduce food waste.
        </p>
      </CardContent>
    </Card>
  );
};

export default PricingEngineCard;
