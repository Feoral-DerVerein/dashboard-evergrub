import { Card } from "@/components/ui/card";
import { SalesForecast } from "@/services/dashboardAnalyticsService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalesForecastCardProps {
  data?: SalesForecast;
  isLoading?: boolean;
}

const SalesForecastCard = ({ data, isLoading }: SalesForecastCardProps) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-[300px] bg-muted rounded"></div>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = data.next7Days.map(day => ({
    day: day.day,
    Forecast: day.forecast,
    Actual: day.actual || null,
    Confidence: day.confidence
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('cards.sales_forecast.title')}</h3>
        <div className="flex items-center gap-2">
          {data.growthVsLastWeek >= 0 ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-destructive" />
          )}
          <span className={`font-semibold ${data.growthVsLastWeek >= 0 ? 'text-success' : 'text-destructive'}`}>
            {data.growthVsLastWeek > 0 ? '+' : ''}{data.growthVsLastWeek.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted-foreground">{t('cards.sales_forecast.total')}</div>
        <div className="text-2xl font-semibold text-foreground">${data.totalForecast.toFixed(2)}</div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="day"
            className="text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-muted-foreground"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Forecast"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
          <Line
            type="monotone"
            dataKey="Actual"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default SalesForecastCard;
