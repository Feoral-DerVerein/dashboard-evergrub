import { Bell, Download, Lock, Home, Plus, User, Package, AlertTriangle, Sun, Cloud, Wind, Settings, Settings2, Users, TrendingUp, Clock, Brain, Sparkles, BarChart3, DollarSign, ArrowUp, ArrowDown, ShoppingCart, CheckCircle, X, ExternalLink, Plug, CreditCard, LogOut, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/LogoutButton";
import { productService, Product } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { AIRecommendations } from "@/components/AIRecommendations";
import SuppliersCard from "@/components/kpi/SuppliersCard";
import RatingInsightCard from "@/components/kpi/RatingInsightCard";
import UploadTrainingDataDialog from "@/components/ai/UploadTrainingDataDialog";
import { AustralianComplianceDialog } from "@/components/AustralianComplianceDialog";
import { supabase } from "@/integrations/supabase/client";
import { DynamicGreeting } from '@/components/DynamicGreeting';
import ChatBot from "@/components/ChatBot";
import { ActionDetailsDialog } from "@/components/ActionDetailsDialog";
import { aiInsightsService } from "@/services/aiInsightsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntelligentNewsCards } from "@/components/kpi/IntelligentNewsCards";
import MelbourneWeatherCard from "@/components/widgets/MelbourneWeatherCard";
import hiMateBanner from "@/assets/hi-mate-banner.png";
type TimeFilterPeriod = "Today" | "Week" | "Month" | "Quarter" | "Year";
const chartDataSamples: Record<TimeFilterPeriod, {
  label: string;
  value: number;
}[]> = {
  Today: [{
    label: "9AM",
    value: 200
  }, {
    label: "10AM",
    value: 320
  }, {
    label: "11AM",
    value: 450
  }, {
    label: "12PM",
    value: 600
  }, {
    label: "1PM",
    value: 520
  }, {
    label: "2PM",
    value: 680
  }, {
    label: "3PM",
    value: 740
  }, {
    label: "4PM",
    value: 820
  }, {
    label: "5PM",
    value: 900
  }],
  Week: [{
    label: "Mon",
    value: 2500
  }, {
    label: "Tue",
    value: 1500
  }, {
    label: "Wed",
    value: 3500
  }, {
    label: "Thu",
    value: 4000
  }, {
    label: "Fri",
    value: 4500
  }, {
    label: "Sat",
    value: 4000
  }, {
    label: "Sun",
    value: 4200
  }],
  Month: [{
    label: "W1",
    value: 8200
  }, {
    label: "W2",
    value: 9100
  }, {
    label: "W3",
    value: 8800
  }, {
    label: "W4",
    value: 9800
  }],
  Quarter: [{
    label: "W1",
    value: 3000
  }, {
    label: "W2",
    value: 3600
  }, {
    label: "W3",
    value: 4200
  }, {
    label: "W4",
    value: 3900
  }, {
    label: "W5",
    value: 4400
  }, {
    label: "W6",
    value: 4800
  }, {
    label: "W7",
    value: 5100
  }, {
    label: "W8",
    value: 5300
  }, {
    label: "W9",
    value: 5500
  }, {
    label: "W10",
    value: 5700
  }, {
    label: "W11",
    value: 5900
  }, {
    label: "W12",
    value: 6100
  }],
  Year: [{
    label: "Jan",
    value: 12000
  }, {
    label: "Feb",
    value: 11500
  }, {
    label: "Mar",
    value: 14000
  }, {
    label: "Apr",
    value: 13500
  }, {
    label: "May",
    value: 15000
  }, {
    label: "Jun",
    value: 14500
  }, {
    label: "Jul",
    value: 16000
  }, {
    label: "Aug",
    value: 15800
  }, {
    label: "Sep",
    value: 14900
  }, {
    label: "Oct",
    value: 15500
  }, {
    label: "Nov",
    value: 16200
  }, {
    label: "Dec",
    value: 17000
  }]
};
const TimeFilterButton = ({
  label,
  isActive = false,
  onClick
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) => <button className={`px-4 py-1.5 rounded-full text-sm ${isActive ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-100"}`} onClick={onClick}>
    {label}
  </button>;
const MetricCard = ({
  icon: Icon,
  value,
  label,
  trend
}: {
  icon: any;
  value: string;
  label: string;
  trend?: string;
}) => <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-blue-600" />
      <span className="text-blue-700/80 text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-blue-900">{value}</span>
      {trend && <span className="text-emerald-600 text-sm font-medium">+{trend}</span>}
    </div>
  </div>;
const SustainabilityCard = ({
  label,
  value,
  subtext,
  icon,
  colorScheme = 'blue'
}: {
  label: string;
  value: string;
  subtext: string;
  icon?: string;
  colorScheme?: 'blue' | 'green';
}) => {
  return (
    <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-700/80 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-blue-900">{value}</span>
        <span className="text-emerald-600 text-sm font-medium">{subtext}</span>
      </div>
    </div>
  );
};
const InsightCard = ({
  label,
  value,
  trend,
  icon
}: {
  label: string;
  value: string;
  trend: string;
  icon?: string;
}) => (
  <div className="apple-card-hover p-4 h-full min-h-28 flex flex-col justify-between bg-white backdrop-blur-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-blue-700/80 text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-blue-900">{value}</span>
      <span className="text-emerald-600 text-sm font-medium">+{trend}</span>
    </div>
  </div>
);
const KPI = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState<TimeFilterPeriod>("Week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Inventory POS state
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{
    id: string;
    name: string;
    type: string;
  }>>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // AI insights state
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentActionDetails, setCurrentActionDetails] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Real business data state
  const [realData, setRealData] = useState({
    co2Saved: "0 kg",
    co2Change: "+0%",
    wasteReduced: "0%",
    wasteTarget: "90%",
    conversionRate: "0%",
    conversionChange: "+0%",
    returnRate: "0%",
    returnChange: "+0%",
    costSavings: "$0",
    costChange: "+0%",
    foodWasteReduced: "0 kg",
    foodWasteChange: "+0%",
    totalSales: "$0",
    salesTrend: "0%",
    transactions: "0",
    transactionsTrend: "0%",
    profit: "$0",
    profitTrend: "0%",
    savings: "$0",
    savingsTrend: "0%",
    revenue: "$0",
    revenueTrend: "0%",
    avgOrderValue: "$0",
    avgOrderTrend: "0%"
  });

  // AI Predictive Insights state
  const [predictiveData, setPredictiveData] = useState({
    topSellingProduct: "Loading...",
    topSellingRate: "0%",
    overstockedItem: "Loading...",
    overstockAmount: "0 units",
    demandForecast: "0%",
    forecastPeriod: "Next week",
    optimalReorder: "3",
    reorderCategory: "Loading..."
  });

  // Load real business data
  const loadRealData = async () => {
    try {
      // TODO: Conectar con datos reales del sistema POS
      // Por ahora, todos los valores están en "0" hasta que se conecte el POS
      console.log('Esperando conexión con sistema POS...');
      
      // Mock suppliers data para que la UI no se rompa
      setSuppliers([{
        id: '1',
        name: 'Local Farm Co.',
        type: 'produce'
      }, {
        id: '2',
        name: 'Organic Supply',
        type: 'organic'
      }, {
        id: '3',
        name: 'Fresh Distributors',
        type: 'dairy'
      }]);
    } catch (error) {
      console.error('Error loading real data:', error);
    }
  };
  useEffect(() => {
    loadRealData();
  }, []);

  // Derived chart data from active period
  const chartData = chartDataSamples[activeTimeFilter] ?? chartDataSamples["Week"];
  const handleTimeFilterClick = (filter: TimeFilterPeriod) => {
    setActiveTimeFilter(filter);
  };
  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      toast.info("Generating NSW EPA compliance report...");

      // Parse numeric values from string data
      const parseNumericValue = (value: string) => {
        return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
      };

      // Sample data structure for NSW EPA compliance report
      // In a real implementation, this would come from your database/API
      const complianceData = {
        businessName: "WiseBite Demo Store",
        address: "123 Main Street, Sydney, NSW 2000",
        ABN: "12 345 678 901",
        businessType: "Food Retail/Café",
        reportPeriod: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        residualWaste: {
          volumeLitres: Math.max(2000 - parseNumericValue(realData.co2Saved), 500),
          containers: [{
            type: "240 L bin",
            quantity: 8
          }, {
            type: "120 L bin",
            quantity: 4
          }],
          collectionFrequency: "twice weekly",
          provider: "Metro Waste Services Pty Ltd"
        },
        foodWaste: {
          volumeLitres: Math.max(parseNumericValue(realData.co2Saved) * 10, 1250),
          containers: [{
            type: "140 L organics bin",
            quantity: 6
          }, {
            type: "80 L kitchen caddy",
            quantity: 3
          }],
          collectionFrequency: "weekly",
          provider: "GreenCycle Organics Ltd",
          destination: "Sydney Organics Processing Facility"
        },
        foodDonations: [{
          category: "Fresh Produce",
          weightKg: Math.max(parseNumericValue(realData.foodWasteReduced), 85),
          recipient: "OzHarvest Sydney"
        }, {
          category: "Bakery Items",
          weightKg: 25,
          recipient: "Local Community Kitchen"
        }, {
          category: "Packaged Goods",
          weightKg: 40,
          recipient: "Salvation Army Food Bank"
        }],
        reductionActions: [{
          action: "Implemented smart inventory tracking via Negentropy platform",
          startDate: "2025-08-01"
        }, {
          action: "Regular food donation program establishment",
          startDate: "2025-08-15"
        }, {
          action: "Staff training on food waste reduction",
          startDate: "2025-09-01"
        }, {
          action: "Kitchen waste separation procedures",
          startDate: "2025-07-15"
        }],
        historicalData: {
          previousPeriod: {
            residualVolumeLitres: 3200,
            foodWasteVolumeLitres: 800
          }
        }
      };

      // Call the edge function to generate the report
      const {
        data: reportData,
        error
      } = await supabase.functions.invoke('generate-nsw-epa-report', {
        body: complianceData
      });
      if (error) {
        console.error('Edge function error:', error);
        toast.error("Failed to generate compliance report. Please try again.");
        return;
      }
      if (reportData?.success && reportData?.report) {
        // Import jsPDF dynamically
        const jsPDF = (await import('jspdf')).default;

        // Create new PDF document
        const pdf = new jsPDF();

        // Convert markdown to plain text for PDF
        const cleanText = reportData.report.replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/✅|❌/g, '') // Remove emoji symbols
        .split('\n').filter(line => line.trim()) // Remove empty lines
        .join('\n');

        // Add title
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('NSW EPA Food Waste Compliance Report', 20, 30);

        // Add business name
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('WiseBite Demo Store', 20, 45);

        // Add date
        const currentDate = new Date().toLocaleDateString();
        pdf.text(`Generated: ${currentDate}`, 20, 55);

        // Split text into lines that fit the page width
        const pageWidth = pdf.internal.pageSize.width;
        const maxLineWidth = pageWidth - 40; // 20px margin on each side
        const lines = pdf.splitTextToSize(cleanText, maxLineWidth);

        // Add content starting from y position 70
        let yPosition = 70;
        const lineHeight = 6;
        const pageHeight = pdf.internal.pageSize.height;
        lines.forEach((line: string) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        });

        // Add official certification seals at the bottom
        try {
          // Ensure we have enough space for the certification section
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 30;
          } else {
            yPosition += 20; // Add some spacing
          }

          // Load and add the certification image
          const certificationImage = new Image();
          certificationImage.onload = () => {
            // Add the certification image
            const imgWidth = 160;
            const imgHeight = 80;
            const xPos = (pageWidth - imgWidth) / 2; // Center the image

            pdf.addImage(certificationImage, 'PNG', xPos, yPosition, imgWidth, imgHeight);

            // Add official document text
            yPosition += imgHeight + 10;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'italic');
            const officialText = 'This document has been certified through the Negentropy platform in compliance with NSW EPA food waste reporting requirements.';
            const officialTextLines = pdf.splitTextToSize(officialText, maxLineWidth);
            officialTextLines.forEach((line: string) => {
              pdf.text(line, 20, yPosition);
              yPosition += 5;
            });

            // Generate filename with current date
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `NSW_EPA_Compliance_Report_${timestamp}.pdf`;

            // Download the PDF
            pdf.save(filename);
            toast.success("NSW EPA compliance report with official certification downloaded successfully!");
          };
          certificationImage.onerror = () => {
            console.warn('Could not load certification image, proceeding without it');
            // Generate filename with current date
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `NSW_EPA_Compliance_Report_${timestamp}.pdf`;

            // Download the PDF
            pdf.save(filename);
            toast.success("NSW EPA compliance report downloaded successfully!");
          };

          // Load the certification image
          certificationImage.src = '/src/assets/negentropy-impact-seals.png';
        } catch (error) {
          console.warn('Error adding certification image:', error);
          // Fallback - generate PDF without image
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `NSW_EPA_Compliance_Report_${timestamp}.pdf`;
          pdf.save(filename);
          toast.success("NSW EPA compliance report downloaded successfully!");
        }
        toast.success("NSW EPA compliance report downloaded successfully!");
      } else {
        toast.error("Failed to generate compliance report. Please check your data.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
  const handleGenerateInsightsWithDetails = () => {
    const details = {
      title: "Generate AI Business Insights",
      description: "This action will analyze your current business data using advanced AI to provide personalized recommendations and predictions.",
      impact: {
        financial: 'Complete financial KPIs and cost savings analysis',
        inventory: 'Detailed waste reduction and optimization metrics',
        environmental: 'Sustainability impact measurement and improvement suggestions',
        timeframe: 'Analysis based on last 30 days of data'
      },
      changes: ['Analyze sales patterns and customer behavior', 'Generate inventory optimization recommendations', 'Create sustainability impact reports', 'Predict demand and market trends'],
      benefits: ['Data-driven decision making', 'Optimized inventory management', 'Improved sustainability practices', 'Competitive advantage through AI insights'],
      risks: ['Recommendations based on historical data patterns', 'Market conditions may vary from predictions']
    };
    showActionDetails(details, handleGenerateInsights);
  };
  const handleDownloadReportWithDetails = () => {
    const details = {
      title: "Generate NSW EPA Compliance Report",
      description: "This action will create a comprehensive NSW Environmental Protection Authority compliance report with your food waste reduction data and Negentropy platform impact.",
      impact: {
        financial: 'Detailed cost savings from waste reduction',
        inventory: 'Complete waste management and reduction metrics',
        environmental: 'Full environmental impact assessment and compliance verification',
        timeframe: 'Report covers all historical data and current compliance status'
      },
      changes: ['Compile all food waste data', 'Calculate environmental impact metrics', 'Generate official EPA compliance documentation', 'Include Negentropy platform contribution analysis'],
      benefits: ['Official EPA compliance verification', 'Regulatory requirement fulfillment', 'Environmental impact documentation', 'Potential tax benefits and incentives'],
      risks: ['Compliance requirements may change', 'Data accuracy dependent on input quality']
    };
    showActionDetails(details, handleDownloadReport);
  };
  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      toast.info("Generating AI insights...");

      // Refresh real data when generating insights
      await loadRealData();
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
      toast.success("Insights generated successfully.");
    } catch (err) {
      console.error("AI insights error:", err);
      toast.error("Could not generate insights.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  return <div className="min-h-screen bg-white pb-20 md:pb-0">
      <div className="w-full min-h-screen animate-fade-in">
          <header className="px-6 pt-8 pb-6">
            <div className="flex justify-between items-center mb-1">
              <div>
                
                <div className="flex justify-center mb-4">
                  
                </div>
                
                
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-14 w-14 cursor-pointer absolute top-2 right-2">
                    <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" alt="Ortega's logo" className="object-cover" />
                    <AvatarFallback>O</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/configuration" className="flex items-center gap-2 w-full">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/api-config" className="flex items-center gap-2 w-full">
                      <Plug className="h-4 w-4" />
                      API Config
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pricing" className="flex items-center gap-2 w-full">
                      <CreditCard className="h-4 w-4" />
                      Pricing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={async () => {
                try {
                  await signOut();
                  toast.success("Session closed successfully");
                  navigate("/login");
                } catch (error) {
                  console.error("Error logging out:", error);
                  toast.error("Error logging out");
                }
              }}>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Welcome Banner */}
          <div className="px-6 mb-6">
            <DynamicGreeting />
          </div>

          {/* AI ChatBot - Inline */}
          <div className="mb-0">
            <ChatBot variant="inline" />
          </div>

          {/* Main dashboard content and chart - Moved to top */}
          <section className="px-6 mt-0 mb-8 space-y-6">
            {/* Time Filters */}
            

            {/* KPI Metrics - Expanded with Profit, Savings, Revenue */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard icon={AreaChart} value={realData.totalSales} label="Total Sales" trend={realData.salesTrend} />
              <MetricCard icon={Lock} value={realData.transactions} label="Transactions" trend={realData.transactionsTrend} />
              <MetricCard icon={Package} value={realData.profit} label="Profit" trend={realData.profitTrend} />
              <MetricCard icon={AlertTriangle} value={realData.savings} label="Operational Savings" trend={realData.savingsTrend} />
              <MetricCard icon={Plus} value={realData.revenue} label="Revenue" trend={realData.revenueTrend} />
              <MetricCard icon={User} value={realData.avgOrderValue} label="Avg Order Value" trend={realData.avgOrderTrend} />
            </div>



      {aiInsights && <div className="space-y-4">
      {/* Main AI Summary */}
      <div className="apple-card-hover p-6 bg-white backdrop-blur-sm border border-gray-200">
        <h4 className="font-semibold mb-2 text-indigo-900">AI Summary</h4>
        <p className="text-sm text-indigo-700/80 mb-3">{aiInsights.executive_summary}</p>
        {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && <div>
            <h5 className="text-sm font-medium mb-1 text-indigo-800">Recommendations</h5>
            <ul className="list-disc pl-5 text-sm text-indigo-700">
              {aiInsights.recommendations.slice(0, 3).map((r: any, i: number) => <li key={i}>{typeof r === 'string' ? r : r.title || JSON.stringify(r)}</li>)}
            </ul>
          </div>}
      </div>

      {/* Sustainability Impact Cards */}
      {aiInsights.sustainability_impact && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="apple-card-hover p-4 bg-white backdrop-blur-sm border border-gray-200">
            <h4 className="font-semibold text-emerald-800 mb-2">Sustainability Impact</h4>
            <div className="space-y-3">
              <div>
                <p className="text-emerald-700/80 text-sm font-medium">CO₂ Saved</p>
                <p className="text-2xl font-bold text-emerald-900">{aiInsights.sustainability_impact.co2_saved_kg} kg</p>
                <p className="text-emerald-600 text-sm font-medium">{aiInsights.sustainability_impact.co2_saved_change}</p>
              </div>
              <div>
                <p className="text-emerald-700/80 text-sm font-medium">Waste Reduced</p>
                <p className="text-2xl font-bold text-emerald-900">{aiInsights.sustainability_impact.waste_reduced_percentage}%</p>
                <p className="text-emerald-600 text-sm font-medium">Target: {aiInsights.sustainability_impact.waste_target}%</p>
              </div>
            </div>
          </div>

          <div className="apple-card-hover p-4 bg-white backdrop-blur-sm border border-gray-200">
            <h4 className="font-semibold text-blue-800 mb-2">Customer Insights</h4>
            <div className="space-y-3">
              <div>
                <p className="text-blue-700/80 text-sm font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-900">{aiInsights.customer_insights.conversion_rate}%</p>
                <p className="text-emerald-600 text-sm font-medium">{aiInsights.customer_insights.conversion_change}</p>
              </div>
              <div>
                <p className="text-blue-700/80 text-sm font-medium">Return Rate</p>
                <p className="text-2xl font-bold text-blue-900">{aiInsights.customer_insights.return_rate}%</p>
                <p className="text-orange-600 text-sm font-medium">{aiInsights.customer_insights.return_change}</p>
              </div>
            </div>
          </div>

          <div className="apple-card-hover p-4 bg-white backdrop-blur-sm border border-gray-200">
            <h4 className="font-semibold text-purple-800 mb-2">Savings & Food Waste</h4>
            <div className="space-y-3">
              <div>
                <p className="text-purple-700/80 text-sm font-medium">Cost Savings</p>
                <p className="text-2xl font-bold text-purple-900">${aiInsights.sustainability_impact.cost_savings}</p>
                <p className="text-emerald-600 text-sm font-medium">{aiInsights.sustainability_impact.cost_savings_change}</p>
              </div>
              <div>
                <p className="text-purple-700/80 text-sm font-medium">Food Waste Reduced</p>
                <p className="text-2xl font-bold text-purple-900">{aiInsights.sustainability_impact.food_waste_reduced_kg} kg</p>
                <p className="text-emerald-600 text-sm font-medium">{aiInsights.sustainability_impact.food_waste_change}</p>
              </div>
            </div>
          </div>
        </div>}
    </div>}
          </section>

          <main className="px-6 md:grid md:grid-cols-4 md:gap-6">
            {/* KPI groups in a single row */}
            <section className="md:col-span-4 order-1 md:order-0 mt-6">
              {/* Sustainability Impact */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Sustainability Impact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SustainabilityCard 
                    label="CO₂ Saved" 
                    value={realData.co2Saved} 
                    subtext={`${realData.co2Change} vs last week`}
                    icon="🌱"
                    colorScheme="blue"
                  />
                  <SustainabilityCard 
                    label="Waste Reduced" 
                    value={realData.wasteReduced} 
                    subtext={`Target: ${realData.wasteTarget}`}
                    icon="♻️"
                    colorScheme="blue"
                  />
                </div>
              </div>

              {/* Customer Insights */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Customer Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InsightCard 
                    label="Conversion Rate" 
                    value={realData.conversionRate} 
                    trend={realData.conversionChange.replace('+', '')}
                    icon="📊"
                  />
                  <InsightCard 
                    label="Return Rate" 
                    value={realData.returnRate} 
                    trend={realData.returnChange.replace('+', '')}
                    icon="🔄"
                  />
                </div>
              </div>

              {/* Savings & Food Waste */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Savings & Food Waste</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SustainabilityCard 
                    label="Cost Savings" 
                    value={realData.costSavings} 
                    subtext={`${realData.costChange} vs last month`}
                    icon="💰"
                    colorScheme="green"
                  />
                  <SustainabilityCard 
                    label="Food Waste Reduced" 
                    value={realData.foodWasteReduced} 
                    subtext={`${realData.foodWasteChange} vs last month`}
                    icon="🍽️"
                    colorScheme="green"
                  />
                </div>
              </div>
            </section>

            {/* AI Predictive Insights */}
            

            {/* Surprise Bags Performance */}
            <section className="md:col-span-4 order-2 md:order-1 mt-0 mb-6">
              <h3 className="text-lg font-semibold mb-4">Surprise Bags Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                <SustainabilityCard label="Active Surprise Bags" value={products.filter(p => p.isSurpriseBag && p.quantity > 0).length.toString()} subtext={`Total created: ${products.filter(p => p.isSurpriseBag).length}`} />
                <SustainabilityCard label="Surprise Bag Revenue" value={`$${Math.round(parseFloat(realData.totalSales.replace(/[$,]/g, '')) * 0.15).toLocaleString()}`} subtext="15% of total sales" />
                <SustainabilityCard label="Food Waste Prevented" value={`${Math.round(products.filter(p => p.isSurpriseBag).length * 2.5)} kg`} subtext="Through surprise bags" />
                <SustainabilityCard label="Environmental Impact" value={`${Math.round(products.filter(p => p.isSurpriseBag).length * 1.8)} kg CO₂`} subtext="Emissions saved" />
              </div>
            </section>

            {/* Customer Satisfaction & Performance */}
            <section className="md:col-span-4 order-2 md:order-1 mt-0 mb-6">
              <h3 className="text-lg font-semibold mb-4">Customer Satisfaction & Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                <RatingInsightCard label="Surprise Bag rating" rating={4.72} status="Looks good" />
                <RatingInsightCard label="Store experience rating" rating={4.75} status="Looks good" />
                <RatingInsightCard label="Cancellations" percentage={0} status="Looks good" />
                <RatingInsightCard label="Refunds" percentage={0} status="Looks good" />
              </div>
            </section>

          </main>

          {/* Main dashboard content and chart - Moved to bottom */}
          

          {/* Auto Tasks and Suppliers Row */}
          <section className="px-6">

            {/* Weather and Visitor Prediction Cards - Moved below Task List */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <MelbourneWeatherCard />

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Visitor Prediction</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-900">94</div>
                      <p className="text-purple-700 text-sm">Expected visitors today</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Up</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-purple-700">Peak: 1:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-purple-700">Confidence: 92%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-purple-800">Key Factors:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">Weekday</span>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">Historical patterns</span>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">Regular hours</span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-100 rounded-lg p-3">
                    <p className="text-purple-800 text-sm">AI recommendation: Normal staffing sufficient</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NSW EPA Compliance Report */}
            <div className="mt-8 max-w-md mx-auto">
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    NSW EPA Compliance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate comprehensive NSW EPA food waste compliance reports with Negentropy platform impact data.
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex justify-center items-center" onClick={handleDownloadReportWithDetails} disabled={isGeneratingReport}>
                    {isGeneratingReport ? "Generating EPA Report..." : "Download EPA Compliance Report"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-sm text-gray-500 space-y-2 mb-6 mt-8">
              <div className="flex flex-col gap-4">
                <AustralianComplianceDialog />
                <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                  Generate Australian legal compliance reports aligned with DCCEEW Food Waste Baseline & Reporting Framework 
                  and NSW Waste Regulation 2026. Essential for businesses to meet national food waste strategy requirements.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Details Dialog */}
        <ActionDetailsDialog open={dialogOpen} onOpenChange={setDialogOpen} actionDetails={currentActionDetails} onConfirm={handleConfirmAction} onCancel={handleCancelAction} />

      <BottomNav />
    </div>;
};
export default KPI;