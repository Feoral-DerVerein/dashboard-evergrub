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
import WeatherWidget from "@/components/widgets/WeatherWidget";
import VisitorPredictionWidget from "@/components/widgets/VisitorPredictionWidget";
import { ActionDetailsDialog } from "@/components/ActionDetailsDialog";
const AI = () => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Mock data for AI predictions and recommendations
  const [predictiveData] = useState({
    topSellingProduct: "Flat White Blend",
    topSellingRate: "92%",
    overstockedItem: "Decaf Coffee Beans",
    overstockAmount: "8 kg excess",
    demandForecast: "+18%",
    forecastPeriod: "Winter season forecast",
    optimalReorder: "3",
    reorderCategory: "Premium Coffee Beans"
  });

  // AI Business Intelligence Data
  const [inventoryRecommendations] = useState([{
    id: 1,
    type: "reduce",
    product: "Decaf Coffee Beans",
    current: "12 kg",
    recommended: "8 kg (-33%)",
    reason: "Low demand, slow rotation in Melbourne market",
    priority: "high",
    savings: "$180"
  }, {
    id: 2,
    type: "increase",
    product: "Oat Milk",
    current: "15 L",
    recommended: "25 L (+67%)",
    reason: "High demand from Melbourne vegans, excellent margins",
    priority: "medium",
    opportunity: "$125"
  }]);
  const [expirationAlerts] = useState([{
    id: 1,
    product: "Almond Croissants",
    quantity: "18 units",
    daysLeft: 2,
    value: "$72",
    priority: "urgent",
    recommendation: "50% discount after 3pm or donate to shelter"
  }, {
    id: 2,
    product: "Fresh Milk",
    quantity: "8 L",
    daysLeft: 3,
    value: "$24",
    priority: "medium",
    recommendation: "Use for coffee drinks first"
  }, {
    id: 3,
    product: "Banana Bread",
    quantity: "6 loaves",
    daysLeft: 1,
    value: "$48",
    priority: "urgent",
    recommendation: "Staff meal or customer free samples"
  }]);
  const [pricingSuggestions] = useState([{
    id: 1,
    product: "Specialty Latte",
    currentPrice: "$6.50",
    suggestedPrice: "$7.20 (+11%)",
    reason: "High demand during Melbourne winter, premium beans justify price",
    impact: "+$280 weekly revenue"
  }, {
    id: 2,
    product: "Vegan Muffins", 
    currentPrice: "$5.00",
    suggestedPrice: "$4.50 (-10%)",
    reason: "Clear stock before weekend batch, attract price-sensitive customers",
    impact: "+45% estimated sales"
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
  const showActionDetails = (actionDetails: any, action: () => void) => {
    setCurrentActionDetails(actionDetails);
    setPendingAction(() => action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      pendingAction();
      setDialogOpen(false);
      setPendingAction(null);
      setCurrentActionDetails(null);
    }
  };

  const handleCancelAction = () => {
    setDialogOpen(false);
    setPendingAction(null);
    setCurrentActionDetails(null);
  };

  const handleAcceptRecommendation = (id: number, type: string, product?: string) => {
    const details = {
      title: `Accept ${type === 'reduce' ? 'Reduction' : 'Increase'} Inventory Recommendation`,
      description: `This action will automatically implement the AI recommendation to optimize your coffee inventory.`,
      impact: {
        financial: type === 'reduce' ? '+$180 weekly savings' : '+$125 weekly opportunity',
        inventory: `${product}: ${type === 'reduce' ? '-33%' : '+67%'} adjustment`,
        environmental: type === 'reduce' ? '15% waste reduction' : 'Higher customer satisfaction',
        timeframe: 'Effective immediately, results in 3-5 days'
      },
      changes: [
        `Automatic order adjustment for ${product}`,
        'Update minimum stock levels',
        'Notify suppliers about changes',
        'Recalibrate inventory alerts'
      ],
      benefits: [
        'Automatic cash flow optimization',
        'Reduction in expired products',
        'Better inventory turnover',
        'Increased profit margins'
      ],
      risks: [
        'Possible temporary stockout if demand unexpectedly increases',
        'Need for monitoring during first week'
      ]
    };
    
    showActionDetails(details, () => {
      toast.success(`${type} recommendation applied automatically for ${product}`);
    });
  };

  const handleSendToMarketplace = (product: string) => {
    const details = {
      title: `Send ${product} to Marketplace`,
      description: `This action will automatically send the product to the marketplace with intelligent discount based on expiration date.`,
      impact: {
        financial: '+$45-65 estimated recovery vs total loss',
        inventory: 'Immediate space liberation',
        environmental: '100% waste prevention',
        timeframe: 'Immediate listing, expected sale in 2-6 hours'
      },
      changes: [
        `Create automatic marketplace listing for ${product}`,
        'Apply 40-60% discount based on urgency',
        'Configure real-time sale notifications',
        'Automatically update inventory after sale'
      ],
      benefits: [
        'Partial investment recovery',
        'Avoid total product loss',
        'Contribute to circular economy',
        'Gain sustainability reputation'
      ],
      risks: [
        'Reduced margin due to necessary discount',
        'Dependence on marketplace demand'
      ]
    };
    
    showActionDetails(details, () => {
      toast.success(`${product} sent to marketplace with automatic discount`);
    });
  };

  const handleReduceOrder = (product: string, percentage: string) => {
    const details = {
      title: `Reduce ${product} Order`,
      description: `This action will automatically reduce your next ${product} order by ${percentage} based on demand patterns and current stock.`,
      impact: {
        financial: `Estimated savings: $120-200 on next order`,
        inventory: `${percentage} reduction in next order`,
        environmental: 'Less potential waste',
        timeframe: 'Applied to next order (3-5 days)'
      },
      changes: [
        `Adjust ${product} quantity by ${percentage}`,
        'Automatically notify supplier of changes',
        'Recalibrate minimum stock alerts',
        'Update demand forecasts'
      ],
      benefits: [
        'Better cash flow management',
        'Reduction in expired products',
        'Storage space optimization',
        'More accurate data for future orders'
      ],
      risks: [
        'Possible shortage if demand suddenly increases',
        'Need for close monitoring during transition'
      ]
    };
    
    showActionDetails(details, () => {
      toast.success(`${product} order reduced by ${percentage} for next week`);
    });
  };

  const handleApplyPromotion = (product: string, days: number) => {
    const details = {
      title: `Apply Promotion to ${product}`,
      description: `This action will automatically apply an intelligent promotion for ${product} expiring in ${days} days.`,
      impact: {
        financial: `Estimated recovery: 70-85% of value vs total loss`,
        inventory: 'Accelerated rotation of soon-to-expire stock',
        environmental: 'Prevention of food waste',
        timeframe: 'Promotion active immediately for 24-48 hours'
      },
      changes: [
        `Automatic ${days <= 1 ? '50%' : '30%'} discount applied`,
        'Push notification to regular customers',
        'Update on cafe digital displays',
        'Automatic social media promotion'
      ],
      benefits: [
        'Significant investment recovery',
        'Increased customer traffic',
        'Improved sustainability perception',
        'Cross-selling opportunity'
      ],
      risks: [
        'Temporarily reduced margin',
        'Possible customer conditioning to discounts'
      ]
    };
    
    showActionDetails(details, () => {
      toast.success(`Promotion automatically applied to ${product}`);
    });
  };

  const handleApplyDynamicPricing = (product: string, currentPrice: string, newPrice: string) => {
    const details = {
      title: `Apply Dynamic Pricing to ${product}`,
      description: `This action will update the price of ${product} from ${currentPrice} to ${newPrice} based on demand and competition analysis.`,
      impact: {
        financial: `Estimated revenue increase: $280 weekly`,
        inventory: 'Price-based rotation optimization',
        environmental: 'Better valuation of premium products',
        timeframe: 'Change effective immediately'
      },
      changes: [
        `Update price from ${currentPrice} to ${newPrice}`,
        'Automatically modify POS system',
        'Update digital and physical menus',
        'Notify barista team of changes'
      ],
      benefits: [
        'Direct increase in margins',
        'Better premium brand positioning',
        'Price-based demand optimization',
        'Improved data for future decisions'
      ],
      risks: [
        'Possible initial resistance from some customers',
        'Need to clearly communicate added value'
      ]
    };
    
    showActionDetails(details, () => {
      toast.success(`Dynamic pricing applied: ${product} now ${newPrice}`);
    });
  };

  const handleGenerateInsightsWithDetails = () => {
    const details = {
      title: 'Generate AI Insights',
      description: 'This action will analyze all your sales, inventory and market trend data to generate personalized intelligent recommendations.',
      impact: {
        financial: 'Identification of savings and profit opportunities',
        inventory: 'Optimizations based on real patterns',
        environmental: 'Sustainability recommendations',
        timeframe: 'Complete analysis in 30-60 seconds'
      },
      changes: [
        'Complete analysis of last 30 days sales data',
        'Comparison with Melbourne market trends',
        'Identification of demand patterns',
        'Generation of personalized recommendations'
      ],
      benefits: [
        'Real data-based decisions',
        'Identification of non-obvious trends',
        'Business-specific recommendations',
        'Competitive market advantage'
      ]
    };
    
    showActionDetails(details, () => {
      handleGenerateInsights();
    });
  };

  const handleDownloadReportWithDetails = () => {
    const details = {
      title: 'Download AI Report',
      description: 'This action will generate a complete PDF report with detailed analysis, recommendations and projections for your coffee shop.',
      impact: {
        financial: 'Complete financial KPIs analysis',
        inventory: 'Detailed optimization report',
        environmental: 'Sustainability metrics',
        timeframe: 'Report generated in 15-30 seconds'
      },
      changes: [
        'Compilation of all relevant data',
        'Generation of charts and visualizations',
        'Inclusion of priority recommendations',
        'Professional PDF document creation'
      ],
      benefits: [
        'Complete documentation for decision making',
        'Material for stakeholder meetings',
        'Historical tracking of improvements',
        'Foundation for strategic planning'
      ]
    };
    
    showActionDetails(details, () => {
      handleDownloadReport();
    });
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

        {/* Widgets */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <WeatherWidget />
          <VisitorPredictionWidget />
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
                    <Button size="sm" onClick={() => handleAcceptRecommendation(rec.id, rec.type, rec.product)} className="bg-blue-600 hover:bg-blue-700">
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
                    <Button size="sm" onClick={() => handleApplyPromotion(alert.product, alert.daysLeft)} className="bg-green-600 hover:bg-green-700">
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
                    <Button size="sm" onClick={() => handleApplyDynamicPricing(suggestion.product, suggestion.currentPrice, suggestion.suggestedPrice)} className="bg-green-600 hover:bg-green-700">
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
                    <Button size="sm" onClick={() => handleApplyPromotion("Atlantic Salmon", 4)} className="bg-green-600 hover:bg-green-700">
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

        {/* AI Control Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 mt-8">
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
              <Button className="w-full" onClick={handleGenerateInsightsWithDetails} disabled={isGeneratingInsights}>
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
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDownloadReportWithDetails} disabled={isGeneratingReport}>
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingReport ? "Generating..." : "Download AI Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Details Dialog */}
        <ActionDetailsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          actionDetails={currentActionDetails}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      </div>
    </div>;
};
export default AI;