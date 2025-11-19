import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface PricingEngineCardProps {
  isLoading?: boolean;
}

const PricingEngineCard = ({ isLoading }: PricingEngineCardProps) => {
  // Fake data for optimal pricing
  const pricingData = [
    { 
      sku: "PROD-001", 
      currentPrice: 12.50, 
      recommendedPrice: 13.80, 
      marginImpact: "+8%", 
      demandImpact: "-3%",
      direction: "up" as const
    },
    { 
      sku: "PROD-002", 
      currentPrice: 8.90, 
      recommendedPrice: 8.90, 
      marginImpact: "0%", 
      demandImpact: "0%",
      direction: "neutral" as const
    },
    { 
      sku: "PROD-003", 
      currentPrice: 15.00, 
      recommendedPrice: 13.50, 
      marginImpact: "-5%", 
      demandImpact: "+12%",
      direction: "down" as const
    },
    { 
      sku: "PROD-004", 
      currentPrice: 22.00, 
      recommendedPrice: 23.50, 
      marginImpact: "+6%", 
      demandImpact: "-2%",
      direction: "up" as const
    },
    { 
      sku: "PROD-005", 
      currentPrice: 9.50, 
      recommendedPrice: 8.20, 
      marginImpact: "-8%", 
      demandImpact: "+15%",
      direction: "down" as const
    },
  ];

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
              {pricingData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
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
              ))}
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
