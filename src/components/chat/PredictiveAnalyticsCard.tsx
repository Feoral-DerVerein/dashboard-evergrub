import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, AlertTriangle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictiveAnalyticsCardProps {
  data?: {
    salesTrend?: number;
    wasteAlert?: number;
    upcomingEvents?: number;
    predictions?: Array<{ date: string; value: number }>;
  };
}

export function PredictiveAnalyticsCard({ data }: PredictiveAnalyticsCardProps) {
  const navigate = useNavigate();

  // Mock data if none provided
  const mockData = data?.predictions || [
    { date: 'Mon', value: 4200 },
    { date: 'Tue', value: 4500 },
    { date: 'Wed', value: 4100 },
    { date: 'Thu', value: 4800 },
    { date: 'Fri', value: 5200 },
    { date: 'Sat', value: 5500 },
    { date: 'Sun', value: 4900 },
  ];

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Predictive Analytics</CardTitle>
          </div>
        </div>
        <CardDescription>AI-powered business insights and forecasting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-xs text-muted-foreground">Sales Trend</p>
            <p className="text-sm font-bold">+{data?.salesTrend || 12}%</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-orange-600" />
            <p className="text-xs text-muted-foreground">Waste Alert</p>
            <p className="text-sm font-bold">{data?.wasteAlert || 23} items</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-sm font-bold">{data?.upcomingEvents || 3}</p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/predictive-analytics')}
          className="w-full"
          variant="default"
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
