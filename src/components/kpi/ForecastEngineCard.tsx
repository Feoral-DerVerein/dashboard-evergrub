import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ForecastEngineCardProps {
  isLoading?: boolean;
}

const ForecastEngineCard = ({ isLoading }: ForecastEngineCardProps) => {
  // Fake data for demand forecast
  const forecastData = [
    { sku: "PROD-001", demandForecast: 245, confidence: 89, drivers: "Seasonal trend, Weather" },
    { sku: "PROD-002", demandForecast: 180, confidence: 92, drivers: "Historical pattern" },
    { sku: "PROD-003", demandForecast: 320, confidence: 78, drivers: "Promotion impact" },
    { sku: "PROD-004", demandForecast: 156, confidence: 85, drivers: "Day of week" },
    { sku: "PROD-005", demandForecast: 290, confidence: 81, drivers: "Supply constraints" },
  ];

  // Chart data for weekly trend
  const chartData = [
    { day: "Mon", demand: 180 },
    { day: "Tue", demand: 210 },
    { day: "Wed", demand: 245 },
    { day: "Thu", demand: 220 },
    { day: "Fri", demand: 280 },
    { day: "Sat", demand: 310 },
    { day: "Sun", demand: 290 },
  ];

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 85) return "default";
    if (confidence >= 75) return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <Card className="apple-card">
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mini Line Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="demand" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Table */}
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold text-right">Demand Forecast</TableHead>
                <TableHead className="font-semibold text-right">Confidence</TableHead>
                <TableHead className="font-semibold">Drivers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell className="text-right">{item.demandForecast} units</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getConfidenceBadgeVariant(item.confidence)}>
                      {item.confidence}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.drivers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          The demand forecast is calculated using historical sales patterns, seasonal trends, weather conditions, 
          promotional activities, and day-of-week effects. Confidence scores reflect model accuracy based on 
          historical prediction performance.
        </p>
      </CardContent>
    </Card>
  );
};

export default ForecastEngineCard;
