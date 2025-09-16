import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const WasteAnalytics = () => {
  // Mock analytics data
  const businessMetrics = {
    wasteToRevenueRatio: 2.3,
    industryAverage: 3.1,
    monthlyTrend: 0.1,
    peakWasteDays: ['Friday', 'Saturday'],
    costPerLiterWaste: 0.85,
    potentialSavings: 2400
  };

  const categoryWaste = [
    { name: 'Fresh Produce', value: 45, volume: 945, color: '#8884d8' },
    { name: 'Prepared Foods', value: 30, volume: 630, color: '#82ca9d' },
    { name: 'Dairy Products', value: 15, volume: 315, color: '#ffc658' },
    { name: 'Bakery Items', value: 10, volume: 210, color: '#ff7300' }
  ];

  const wasteReductionOpportunities = [
    { category: 'Dynamic Pricing', potential: 15, impact: 'High', effort: 'Medium' },
    { category: 'Inventory Optimization', potential: 12, impact: 'High', effort: 'High' },
    { category: 'Staff Training', potential: 8, impact: 'Medium', effort: 'Low' },
    { category: 'Packaging Improvement', potential: 6, impact: 'Medium', effort: 'Medium' }
  ];

  const weeklyPattern = [
    { day: 'Mon', waste: 1850, revenue: 18500 },
    { day: 'Tue', waste: 1920, revenue: 19200 },
    { day: 'Wed', waste: 1780, revenue: 17800 },
    { day: 'Thu', waste: 2100, revenue: 21000 },
    { day: 'Fri', waste: 2450, revenue: 24500 },
    { day: 'Sat', waste: 2380, revenue: 23800 },
    { day: 'Sun', waste: 1650, revenue: 16500 }
  ];

  const getBenchmarkColor = (current: number, benchmark: number, isLowerBetter: boolean = true) => {
    const isGood = isLowerBetter ? current < benchmark : current > benchmark;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <div className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Waste-to-Revenue Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getBenchmarkColor(businessMetrics.wasteToRevenueRatio, businessMetrics.industryAverage)}`}>
                  {businessMetrics.wasteToRevenueRatio}%
                </span>
                {getTrendIcon(businessMetrics.monthlyTrend)}
                <span className="text-sm text-gray-600">
                  {businessMetrics.monthlyTrend > 0 ? '+' : ''}{businessMetrics.monthlyTrend}% vs last month
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry Average:</span>
                  <span className="font-medium">{businessMetrics.industryAverage}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  {businessMetrics.wasteToRevenueRatio < businessMetrics.industryAverage 
                    ? '✓ Below industry average - good performance' 
                    : '⚠ Above industry average - optimization opportunity'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Peak Waste Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-orange-600">
                {businessMetrics.peakWasteDays.join(' & ')}
              </div>
              <div className="text-sm text-gray-600">
                Highest waste generation days
              </div>
              <div className="text-xs p-2 bg-orange-100 rounded">
                <strong>Suggestion:</strong> Consider additional FOGO pickups on weekends or implement weekend-specific waste reduction strategies
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                ${businessMetrics.potentialSavings}
              </div>
              <div className="text-sm text-gray-600">
                Monthly reduction potential
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Cost per liter:</span>
                  <span>${businessMetrics.costPerLiterWaste}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Based on waste reduction opportunities
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste by Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Waste by Category
            </CardTitle>
            <CardDescription>Current weekly breakdown by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryWaste}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {categoryWaste.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryWaste.map((category, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{category.volume}L</div>
                    <div className="text-xs text-gray-500">{category.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Weekly Waste Pattern
            </CardTitle>
            <CardDescription>Daily waste vs revenue correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'revenue' ? '$' : 'L'}`, 
                      name === 'revenue' ? 'Revenue' : 'Waste'
                    ]}
                  />
                  <Bar dataKey="waste" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Insight:</strong> Friday and Saturday show highest waste volumes correlating with peak sales days.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reduction Opportunities */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Waste Reduction Opportunities
            <Badge className="bg-emerald-100 text-emerald-700">AI Recommendations</Badge>
          </CardTitle>
          <CardDescription>
            Prioritized strategies based on your business data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wasteReductionOpportunities.map((opportunity, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{opportunity.category}</h4>
                  <div className="flex gap-2">
                    <Badge 
                      className={
                        opportunity.impact === 'High' ? 'bg-red-100 text-red-700' :
                        opportunity.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }
                    >
                      {opportunity.impact} Impact
                    </Badge>
                    <Badge 
                      className={
                        opportunity.effort === 'High' ? 'bg-red-100 text-red-700' :
                        opportunity.effort === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }
                    >
                      {opportunity.effort} Effort
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Potential Reduction:</span>
                    <span className="font-bold text-emerald-600">{opportunity.potential}%</span>
                  </div>
                  <Progress value={opportunity.potential * 2} className="h-2" />
                  <div className="text-xs text-gray-600">
                    {opportunity.category === 'Dynamic Pricing' && 
                      'Implement time-based pricing for items nearing expiry to increase sales velocity'}
                    {opportunity.category === 'Inventory Optimization' && 
                      'Use AI-powered demand forecasting to optimize ordering and reduce overstock'}
                    {opportunity.category === 'Staff Training' && 
                      'Train staff on proper storage techniques and first-in-first-out inventory rotation'}
                    {opportunity.category === 'Packaging Improvement' && 
                      'Upgrade to extended-life packaging for products with high spoilage rates'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WasteAnalytics;