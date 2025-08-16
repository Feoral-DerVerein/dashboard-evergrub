import { useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PredictionData {
  expectedVisitors: number;
  confidence: number;
  peakHour: string;
  trend: "up" | "down" | "stable";
  factors: string[];
}

const VisitorPredictionWidget = () => {
  const [prediction, setPrediction] = useState<PredictionData>({
    expectedVisitors: 142,
    confidence: 87,
    peakHour: "7:30 PM",
    trend: "up",
    factors: ["Weekend", "Good weather", "Local event nearby"]
  });

  // Simulate AI prediction updates based on time and historical data
  useEffect(() => {
    const updatePrediction = () => {
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      
      let baseVisitors = 100;
      
      // Weekend boost
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseVisitors += 40;
      }
      
      // Time of day adjustments
      if (currentHour >= 18 && currentHour <= 21) {
        baseVisitors += 30;
      } else if (currentHour >= 12 && currentHour <= 14) {
        baseVisitors += 20;
      }
      
      // Random variation
      const variation = Math.floor(Math.random() * 30) - 15;
      const finalVisitors = Math.max(50, baseVisitors + variation);
      
      const trends = ["up", "down", "stable"] as const;
      const currentTrend = trends[Math.floor(Math.random() * trends.length)];
      
      setPrediction({
        expectedVisitors: finalVisitors,
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
        peakHour: currentHour < 12 ? "7:30 PM" : "1:00 PM",
        trend: currentTrend,
        factors: [
          dayOfWeek === 0 || dayOfWeek === 6 ? "Weekend" : "Weekday",
          "Historical patterns",
          currentHour >= 18 ? "Dinner rush" : "Regular hours"
        ]
      });
    };

    updatePrediction();
    const interval = setInterval(updatePrediction, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingUp className="w-4 h-4 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-white/80 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Users className="w-5 h-5" />
          Visitor Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{prediction.expectedVisitors}</p>
              <p className="text-sm text-gray-600">Expected visitors today</p>
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
              {getTrendIcon(prediction.trend)}
              <span className="text-sm font-medium capitalize">{prediction.trend}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Peak: {prediction.peakHour}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Confidence: {prediction.confidence}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Key Factors:</p>
            <div className="flex flex-wrap gap-1">
              {prediction.factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-800">
              AI recommendation: {prediction.expectedVisitors > 130 ? "Prepare extra staff" : "Normal staffing sufficient"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorPredictionWidget;