import { useState } from "react";
import { Download, Brain, Sparkles, BarChart3, AlertTriangle, TrendingUp, DollarSign, Package, Clock, ArrowUp, ArrowDown, ShoppingCart, CheckCircle, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateKpiReport, TimeFilterPeriod } from "@/utils/reportGenerator";
import UploadTrainingDataDialog from "@/components/ai/UploadTrainingDataDialog";
import { AIRecommendations } from "@/components/AIRecommendations";
import { supabase } from "@/integrations/supabase/client";
const AI = () => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");

  // Mock data for AI predictions and recommendations
  const [predictiveData] = useState({
    topSellingProduct: "Organic Vegetables",
    topSellingRate: "87%",
    overstockedItem: "Canned Goods",
    overstockAmount: "15 units excess",
    demandForecast: "+12%",
    forecastPeriod: "Next week prediction",
    optimalReorder: "4",
    reorderCategory: "Fresh Produce"
  });

  // AI Business Intelligence Data
  const [inventoryRecommendations] = useState([{
    id: 1,
    type: "reduce",
    product: "Atlantic Salmon",
    current: "25 kg",
    recommended: "15 kg (-40%)",
    reason: "Stock expires in 4 days, slow sales",
    priority: "high",
    savings: "$450"
  }, {
    id: 2,
    type: "increase",
    product: "Organic Vegetables",
    current: "10 kg",
    recommended: "18 kg (+80%)",
    reason: "High demand, good margin",
    priority: "medium",
    opportunity: "$230"
  }]);
  const [expirationAlerts] = useState([{
    id: 1,
    product: "Atlantic Salmon",
    quantity: "15 kg",
    daysLeft: 4,
    value: "$450",
    priority: "urgent",
    recommendation: "Move to daily special menu"
  }, {
    id: 2,
    product: "Gourmet Cheese",
    quantity: "8 units",
    daysLeft: 6,
    value: "$120",
    priority: "medium",
    recommendation: "15% discount to accelerate sales"
  }, {
    id: 3,
    product: "Artisan Bread",
    quantity: "12 breads",
    daysLeft: 2,
    value: "$36",
    priority: "urgent",
    recommendation: "2x1 promotion or donate"
  }]);
  const [pricingSuggestions] = useState([{
    id: 1,
    product: "Premium Salad",
    currentPrice: "$12",
    suggestedPrice: "$10 (-17%)",
    reason: "Accelerate rotation before expiration",
    impact: "+35% estimated sales"
  }, {
    id: 2,
    product: "Green Smoothie",
    currentPrice: "$8",
    suggestedPrice: "$9 (+12%)",
    reason: "High demand, low competition",
    impact: "+$45 weekly revenue"
  }]);
  const [realData] = useState({
    co2Saved: "125 kg",
    co2Change: "+18% vs last week",
    wasteReduced: "78%",
    wasteTarget: "90%",
    conversionRate: "34%",
    conversionChange: "+2.1%",
    returnRate: "5%",
    returnChange: "+1.3%",
    costSavings: "$2,340",
    costChange: "+14% vs last month",
    foodWasteReduced: "89 kg",
    foodWasteChange: "+9% vs last month"
  });
  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      toast.info("Generating AI insights...");
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-train', {
        body: {
          period: activeTimeFilter
        }
      });
      if (error) throw error;
      setAiInsights(data);
      toast.success("AI insights generated successfully!");
    } catch (err) {
      console.error("AI insights error:", err);
      toast.error("Could not generate insights. Please try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      toast.info("Generating AI report...");
      await generateKpiReport(activeTimeFilter);
      toast.success("AI report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const handleAcceptRecommendation = (id: number, type: string) => {
    toast.success(`${type} recommendation accepted and applied automatically`);
  };
  const handleSendToMarketplace = (product: string) => {
    toast.success(`${product} sent to marketplace with automatic discount`);
  };
  const handleReduceOrder = (product: string, percentage: string) => {
    toast.success(`${product} order reduced by ${percentage} for next week`);
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            
            <h1 className="text-3xl px-[250px] font-thin text-gray-950 text-center"> Welcome to Negentropy AI</h1>
          </div>
          <p className="text-gray-600">
            Harness the power of artificial intelligence to optimize your business operations, 
            reduce waste, and maximize sustainability impact.
          </p>
        </div>

        {/* AI Control Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Training Data Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Training Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload your business data to improve AI predictions and recommendations.
              </p>
              <UploadTrainingDataDialog />
            </CardContent>
          </Card>

          {/* Generate Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Generate intelligent insights based on your current data and market trends.
              </p>
              <Button className="w-full" onClick={handleGenerateInsights} disabled={isGeneratingInsights}>
                {isGeneratingInsights ? "Generating..." : "Generate AI Insights"}
              </Button>
            </CardContent>
          </Card>

          {/* Download Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                AI Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Generate comprehensive AI-powered business reports with predictions.
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDownloadReport} disabled={isGeneratingReport}>
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingReport ? "Generating..." : "Download AI Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Inventory Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryRecommendations.map(rec => <div key={rec.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{rec.product}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority === "high" ? "High" : "Medium"} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                       <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">Current: <strong>{rec.current}</strong></span>
                        <span className="text-blue-600">Recommended: <strong>{rec.recommended}</strong></span>
                        {rec.savings && <span className="text-green-600">Savings: <strong>{rec.savings}</strong></span>}
                        {rec.opportunity && <span className="text-green-600">Opportunity: <strong>{rec.opportunity}</strong></span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {rec.type === "reduce" ? <ArrowDown className="w-5 h-5 text-red-500" /> : <ArrowUp className="w-5 h-5 text-green-500" />}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptRecommendation(rec.id, rec.type)} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept Recommendation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReduceOrder(rec.product, rec.type === "reduce" ? "40%" : "80%")}>
                      Adjust Order
                    </Button>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Expiration Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Priority Expiration Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expirationAlerts.map(alert => <div key={alert.id} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{alert.product}</h4>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.daysLeft} days remaining
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          Value: {alert.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {alert.quantity} • Recommendation: {alert.recommendation}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptRecommendation(alert.id, "promotion")} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply Promotion
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSendToMarketplace(alert.product)}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Send to Marketplace
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReduceOrder(alert.product, "20%")}>
                      Reduce Order
                    </Button>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Pricing Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Dynamic Pricing Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricingSuggestions.map(suggestion => <div key={suggestion.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{suggestion.product}</h4>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                       <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">Current price: <strong>{suggestion.currentPrice}</strong></span>
                        <span className="text-green-600">Suggested price: <strong>{suggestion.suggestedPrice}</strong></span>
                        <span className="text-blue-600">Impact: <strong>{suggestion.impact}</strong></span>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptRecommendation(suggestion.id, "pricing")} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply Price
                    </Button>
                    <Button size="sm" variant="outline">
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Practical Example Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="w-5 h-5" />
              📊 Practical Example: Hotel with Critical Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Smart Alert</h4>
                  <p className="text-gray-700 mb-3">
                    "You have <strong>15 kg of salmon</strong> that will expire in <strong>4 days</strong>. 
                    Recommendation: reduce this week's order by <strong>20%</strong> and move stock to daily special menu."
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button size="sm" onClick={() => handleAcceptRecommendation(1, "emergency")} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept Recommendation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSendToMarketplace("Atlantic Salmon")}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Send to Marketplace
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReduceOrder("Salmon", "20%")}>
                      <Package className="w-4 h-4 mr-1" />
                      Reduce Order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <AIRecommendations predictiveData={predictiveData} realData={realData} />

        {/* AI Insights Results */}
        {aiInsights && <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main AI Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">AI Executive Summary</h4>
                  <p className="text-sm text-gray-600 mb-3">{aiInsights.executive_summary}</p>
                  {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && <div>
                      <h5 className="text-sm font-medium mb-1">Key Recommendations</h5>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {aiInsights.recommendations.slice(0, 5).map((r: any, i: number) => <li key={i}>{typeof r === 'string' ? r : r.title || JSON.stringify(r)}</li>)}
                      </ul>
                    </div>}
                </div>

                {/* Sustainability Impact */}
                {aiInsights.sustainability_impact && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-green-700 mb-2">Environmental Impact</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 text-sm">CO₂ Saved</p>
                          <p className="text-xl font-bold text-green-800">{aiInsights.sustainability_impact.co2_saved_kg} kg</p>
                          <p className="text-green-600 text-sm">{aiInsights.sustainability_impact.co2_saved_change}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Waste Reduced</p>
                          <p className="text-xl font-bold text-green-800">{aiInsights.sustainability_impact.waste_reduced_percentage}%</p>
                          <p className="text-green-600 text-sm">Target: {aiInsights.sustainability_impact.waste_target}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-700 mb-2">Customer Analytics</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 text-sm">Conversion Rate</p>
                          <p className="text-xl font-bold text-blue-800">{aiInsights.customer_insights.conversion_rate}%</p>
                          <p className="text-blue-600 text-sm">{aiInsights.customer_insights.conversion_change}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Return Rate</p>
                          <p className="text-xl font-bold text-blue-800">{aiInsights.customer_insights.return_rate}%</p>
                          <p className="text-blue-600 text-sm">{aiInsights.customer_insights.return_change}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-700 mb-2">Financial Impact</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 text-sm">Cost Savings</p>
                          <p className="text-xl font-bold text-yellow-800">${aiInsights.sustainability_impact.cost_savings}</p>
                          <p className="text-yellow-600 text-sm">{aiInsights.sustainability_impact.cost_savings_change}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Food Waste Reduced</p>
                          <p className="text-xl font-bold text-yellow-800">{aiInsights.sustainability_impact.food_waste_reduced_kg} kg</p>
                          <p className="text-yellow-600 text-sm">{aiInsights.sustainability_impact.food_waste_change}</p>
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default AI;