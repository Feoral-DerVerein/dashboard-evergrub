import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target } from 'lucide-react';

const WastePredictor = () => {
  const [predictionData, setPredictionData] = useState({
    currentWeeklyFOGO: 1850,
    predictedWeeklyFOGO: 2100,
    confidenceLevel: 87,
    trendDirection: 'increasing' as 'increasing' | 'decreasing' | 'stable',
    daysToMandateThreshold: 180,
    mandateThreshold: 1920,
    nextThreshold: 3840
  });

  // Mock historical data
  const weeklyTrends = [
    { week: 'Week 1', sales: 15000, predictedWaste: 1650, actualWaste: 1700 },
    { week: 'Week 2', sales: 18000, predictedWaste: 1980, actualWaste: 1950 },
    { week: 'Week 3', sales: 16500, predictedWaste: 1815, actualWaste: 1850 },
    { week: 'Week 4', sales: 19500, predictedWaste: 2145, actualWaste: 2100 },
    { week: 'Week 5', sales: 21000, predictedWaste: 2310, actualWaste: null },
    { week: 'Week 6', sales: 22500, predictedWaste: 2475, actualWaste: null }
  ];

  const categoryBreakdown = [
    { category: 'Fresh Produce', percentage: 45, volume: 945 },
    { category: 'Prepared Foods', percentage: 30, volume: 630 },
    { category: 'Dairy Products', percentage: 15, volume: 315 },
    { category: 'Bakery Items', percentage: 10, volume: 210 }
  ];

  const getThresholdStatus = () => {
    const { predictedWeeklyFOGO, mandateThreshold, nextThreshold } = predictionData;
    
    if (predictedWeeklyFOGO >= nextThreshold) {
      return { level: 'critical', color: 'text-red-600', message: 'Above 3,840L threshold - Mandate applies July 2026' };
    } else if (predictedWeeklyFOGO >= mandateThreshold) {
      return { level: 'warning', color: 'text-yellow-600', message: 'Above 1,920L threshold - Mandate applies July 2028' };
    } else if (predictedWeeklyFOGO >= 660) {
      return { level: 'info', color: 'text-blue-600', message: 'Above 660L threshold - Mandate applies July 2030' };
    } else {
      return { level: 'safe', color: 'text-green-600', message: 'Below mandate thresholds' };
    }
  };

  const thresholdStatus = getThresholdStatus();
  const progressPercentage = (predictionData.predictedWeeklyFOGO / predictionData.nextThreshold) * 100;

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Waste Prediction
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {predictionData.confidenceLevel}% Confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                Based on POS sales data and industry waste ratios
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current vs Predicted */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Weekly FOGO</span>
                <span className="font-bold text-lg">{predictionData.currentWeeklyFOGO}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Predicted Weekly FOGO</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-purple-600">{predictionData.predictedWeeklyFOGO}L</span>
                  {predictionData.trendDirection === 'increasing' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : predictionData.trendDirection === 'decreasing' ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Threshold Progress */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Mandate Threshold Progress</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className={`text-xs ${thresholdStatus.color}`}>
                {thresholdStatus.message}
              </p>
            </div>

            {/* Days to Threshold */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Time to Next Mandate</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {predictionData.daysToMandateThreshold}
                </div>
                <div className="text-xs text-gray-600">days until July 2028</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales vs FOGO Prediction Trends</CardTitle>
            <CardDescription>6-week analysis with prediction accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${String(name).includes('sales') ? '$' : 'L'}`, 
                    String(name).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="weeklySales"
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedWaste" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="predictedWaste"
                />
                <Line 
                  type="monotone" 
                  dataKey="actualWaste" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="actualWaste"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">FOGO by Category</CardTitle>
            <CardDescription>Predicted weekly volumes by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}L`, 'Volume']} />
                <Bar dataKey="volume" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="font-medium">{item.percentage}% ({item.volume}L)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Benchmarks */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Industry Waste Ratios Applied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Fresh Produce</div>
              <div className="text-xl font-bold text-blue-600">4.2%</div>
              <div className="text-xs text-gray-500">of sales volume</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Prepared Foods</div>
              <div className="text-xl font-bold text-blue-600">12%</div>
              <div className="text-xs text-gray-500">of ingredient cost</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Dairy Products</div>
              <div className="text-xl font-bold text-blue-600">2.1%</div>
              <div className="text-xs text-gray-500">near expiry waste</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-600">Accuracy Score</div>
              <div className="text-xl font-bold text-green-600">94%</div>
              <div className="text-xs text-gray-500">vs actual data</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WastePredictor;