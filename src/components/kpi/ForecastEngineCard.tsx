import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/dashboard/HelpTooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { performanceEngineService, ForecastItem, ForecastChartData } from "@/services/performanceEngineService";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface ForecastEngineCardProps {
  isLoading?: boolean;
}

const ForecastEngineCard = ({ isLoading: externalLoading }: ForecastEngineCardProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [chartData, setChartData] = useState<ForecastChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const data = await performanceEngineService.getForecastData(user.uid);
        setForecastData(data.forecastData);
        setChartData(data.chartData);
      } catch (error) {
        console.error("Error loading forecast data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  const isLoading = externalLoading || loading;

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 85) return "default";
    if (confidence >= 75) return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <Card className="apple-card">
        <CardHeader>
          <CardTitle>{t('cards.forecast_engine.title')}</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          {t('cards.forecast_engine.title')}
          <HelpTooltip kpiName={t('cards.forecast_engine.title')} />
        </CardTitle>
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
                <TableHead className="font-semibold">{t('cards.forecast_engine.table.sku')}</TableHead>
                <TableHead className="font-semibold text-right">{t('cards.forecast_engine.table.forecast')}</TableHead>
                <TableHead className="font-semibold text-right">{t('cards.forecast_engine.table.confidence')}</TableHead>
                <TableHead className="font-semibold">{t('cards.forecast_engine.table.drivers')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t('cards.forecast_engine.no_data')}
                  </TableCell>
                </TableRow>
              ) : (
                forecastData.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.sku}</span>
                        <span className="text-xs text-muted-foreground">{item.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.demandForecast} units</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getConfidenceBadgeVariant(item.confidence)}>
                        {item.confidence}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.drivers}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Explanation */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('cards.forecast_engine.explanation')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ForecastEngineCard;
