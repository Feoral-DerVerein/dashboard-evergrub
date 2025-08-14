import { useState } from "react";
import { Download, Brain, Sparkles, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      const { data, error } = await supabase.functions.invoke('ai-train', {
        body: { period: activeTimeFilter }
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">WiseBite AI</h1>
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
              <Button 
                className="w-full" 
                onClick={handleGenerateInsights} 
                disabled={isGeneratingInsights}
              >
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
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleDownloadReport} 
                disabled={isGeneratingReport}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingReport ? "Generating..." : "Download AI Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictive Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">AI Predictive Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-1">Top Selling Product</h4>
                <p className="text-lg font-bold text-blue-800">{predictiveData.topSellingProduct}</p>
                <p className="text-sm text-blue-600">{predictiveData.topSellingRate} sell-through rate</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-1">Overstocked Item</h4>
                <p className="text-lg font-bold text-orange-800">{predictiveData.overstockedItem}</p>
                <p className="text-sm text-orange-600">{predictiveData.overstockAmount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-1">Demand Forecast</h4>
                <p className="text-lg font-bold text-green-800">{predictiveData.demandForecast}</p>
                <p className="text-sm text-green-600">{predictiveData.forecastPeriod}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-1">Optimal Reorder</h4>
                <p className="text-lg font-bold text-purple-800">{predictiveData.optimalReorder} days</p>
                <p className="text-sm text-purple-600">For {predictiveData.reorderCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <AIRecommendations predictiveData={predictiveData} realData={realData} />

        {/* AI Insights Results */}
        {aiInsights && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main AI Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">AI Executive Summary</h4>
                  <p className="text-sm text-gray-600 mb-3">{aiInsights.executive_summary}</p>
                  {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Key Recommendations</h5>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {aiInsights.recommendations.slice(0, 5).map((r: any, i: number) => (
                          <li key={i}>{typeof r === 'string' ? r : r.title || JSON.stringify(r)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sustainability Impact */}
                {aiInsights.sustainability_impact && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AI;