
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit, 
  Copy, 
  BarChart,
  Calendar,
  Table as TableIcon,
  LineChart,
  Settings,
  Download,
  BriefcaseBusiness,
  Banknote,
  CircleDollarSign,
  TrendingUp,
  Users,
  MousePointerClick,
  Share2,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const mockCampaigns = [
  {
    id: "1",
    name: "Summer Coffee Promotion",
    objective: "Conversions",
    status: "active",
    budget: {
      type: "daily",
      amount: 50.00
    },
    results: 128,
    reach: 11250,
    impressions: 22340,
    cost: 0.39,
    startDate: "2023-06-10",
    endDate: "2023-07-10",
    adSets: [
      {
        id: "1-1",
        name: "Coffee Enthusiasts",
        status: "active",
        budget: 30.00,
        results: 78,
        reach: 6780,
        impressions: 13400,
        cost: 0.38,
        schedule: "Continuous",
        audience: "Coffee drinkers, 25-45",
        placement: "Automatic"
      },
      {
        id: "1-2",
        name: "Previous Customers",
        status: "active",
        budget: 20.00,
        results: 50,
        reach: 4470,
        impressions: 8940,
        cost: 0.40,
        schedule: "Continuous",
        audience: "Custom audience - Website Visitors",
        placement: "Facebook Feed, Instagram Feed"
      }
    ]
  },
  {
    id: "2",
    name: "Coffee Equipment Sale",
    objective: "Traffic",
    status: "inactive",
    budget: {
      type: "lifetime",
      amount: 300.00
    },
    results: 215,
    reach: 18670,
    impressions: 37340,
    cost: 0.30,
    startDate: "2023-04-15",
    endDate: "2023-05-15",
    adSets: [
      {
        id: "2-1",
        name: "Home Baristas",
        status: "inactive",
        budget: 150.00,
        results: 124,
        reach: 10200,
        impressions: 20400,
        cost: 0.29,
        schedule: "Apr 15 - May 15",
        audience: "Interest: Home Brewing, Coffee Making",
        placement: "Facebook Feed, Instagram Feed"
      },
      {
        id: "2-2",
        name: "Coffee Shop Owners",
        status: "inactive",
        budget: 150.00,
        results: 91,
        reach: 8470,
        impressions: 16940,
        cost: 0.31,
        schedule: "Apr 15 - May 15",
        audience: "Business Owners in Food Industry",
        placement: "Automatic"
      }
    ]
  },
  {
    id: "3",
    name: "New Coffee Blend Launch",
    objective: "Awareness",
    status: "active",
    budget: {
      type: "daily",
      amount: 25.00
    },
    results: 58,
    reach: 7850,
    impressions: 15700,
    cost: 0.43,
    startDate: "2023-10-01",
    endDate: "2023-11-30",
    adSets: [
      {
        id: "3-1",
        name: "Local Market",
        status: "active",
        budget: 15.00,
        results: 34,
        reach: 4710,
        impressions: 9420,
        cost: 0.44,
        schedule: "Continuous",
        audience: "Coffee drinkers within 15 miles",
        placement: "Facebook Feed, Facebook Stories, Instagram Feed"
      },
      {
        id: "3-2",
        name: "Coffee Influencers",
        status: "active",
        budget: 10.00,
        results: 24,
        reach: 3140,
        impressions: 6280,
        cost: 0.42,
        schedule: "Continuous",
        audience: "Lookalike - Coffee Blog Subscribers",
        placement: "Automatic"
      }
    ]
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "";
  
  switch (status) {
    case "active":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "inactive":
      colorClass = "bg-gray-100 text-gray-800";
      break;
    default:
      colorClass = "bg-blue-100 text-blue-800";
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Ads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedView, setSelectedView] = useState("campaigns");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("last30days");
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = 
      searchTerm === "" || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = 
      activeTab === "all" || 
      campaign.status === activeTab;
      
    return matchesSearch && matchesTab;
  });
  
  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(campaign => campaign.id));
    }
  };
  
  const handleStatusChange = (campaignId: string, newStatus: string) => {
    toast.success(`Campaign status changed to ${newStatus}`);
  };
  
  const handleDeleteCampaign = (campaignId: string) => {
    toast.success("Campaign deleted successfully");
  };
  
  const handleDuplicateCampaign = (campaignId: string) => {
    toast.success("Campaign duplicated successfully");
  };

  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };
  
  const totalReach = mockCampaigns.reduce((sum, campaign) => sum + campaign.reach, 0);
  const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalResults = mockCampaigns.reduce((sum, campaign) => sum + campaign.results, 0);
  const averageCost = mockCampaigns.reduce((sum, campaign) => sum + campaign.cost, 0) / mockCampaigns.length;
  const totalSpend = mockCampaigns.reduce((sum, campaign) => {
    if (campaign.budget.type === "daily") {
      return sum + (campaign.budget.amount * 30);
    } else {
      return sum + campaign.budget.amount;
    }
  }, 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className="text-gray-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-semibold">Ads</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Select Date Range</h3>
                    <div className="space-y-2">
                      {["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Last month", "Custom Range"].map((range) => (
                        <div key={range} className="flex items-center p-2 border-b">
                          <button 
                            className="w-full text-left py-2" 
                            onClick={() => {
                              setDateRange(range.toLowerCase().replace(/\s/g, ''));
                              document.body.click(); // Close the sheet
                            }}
                          >
                            {range}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Select defaultValue="last30days">
                <SelectTrigger className="w-[180px] h-9">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Link to="/ads/create">
              <Button size="sm" className="h-8 w-8 p-0 md:w-auto md:px-2">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline ml-1">Create</span>
              </Button>
            </Link>
          </div>
        </header>
        
        <main className="p-4">
          {/* Mobile Performance Overview - Stacked Cards */}
          {isMobile ? (
            <div className="mb-4 overflow-x-auto scrollbar-none -mx-4 px-4">
              <div className="flex gap-3 pb-1 w-max">
                <Card className="shadow-sm w-[140px] flex-shrink-0">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Reach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2 px-3">
                    <p className="text-sm font-semibold">{totalReach.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm w-[140px] flex-shrink-0">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Impressions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2 px-3">
                    <p className="text-sm font-semibold">{totalImpressions.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm w-[140px] flex-shrink-0">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <MousePointerClick className="h-3 w-3 mr-1" />
                      Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2 px-3">
                    <p className="text-sm font-semibold">{totalResults}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm w-[140px] flex-shrink-0">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <CircleDollarSign className="h-3 w-3 mr-1" />
                      Cost/Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2 px-3">
                    <p className="text-sm font-semibold">${averageCost.toFixed(2)}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm w-[140px] flex-shrink-0">
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Banknote className="h-3 w-3 mr-1" />
                      Total Spend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2 px-3">
                    <p className="text-sm font-semibold">${totalSpend.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="mb-5">
              <h2 className="text-lg font-medium mb-2">Performance Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Reach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 px-4">
                    <p className="text-lg font-semibold">{totalReach.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Impressions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 px-4">
                    <p className="text-lg font-semibold">{totalImpressions.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <MousePointerClick className="h-3 w-3 mr-1" />
                      Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 px-4">
                    <p className="text-lg font-semibold">{totalResults}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <CircleDollarSign className="h-3 w-3 mr-1" />
                      Cost per Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 px-4">
                    <p className="text-lg font-semibold">${averageCost.toFixed(2)}</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-xs text-gray-500 font-normal flex items-center">
                      <Banknote className="h-3 w-3 mr-1" />
                      Total Spend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 px-4">
                    <p className="text-lg font-semibold">${totalSpend.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Mobile View Switcher - Bottom Fixed Tab Bar */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 px-1 py-1">
              <div className="grid grid-cols-4 gap-1">
                <button
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-md ${selectedView === 'campaigns' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedView('campaigns')}
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="text-xs mt-1">Campaigns</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-md ${selectedView === 'adSets' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedView('adSets')}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs mt-1">Ad Sets</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-md ${selectedView === 'ads' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedView('ads')}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs mt-1">Ads</span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-md ${selectedView === 'audiences' ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedView('audiences')}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs mt-1">Audiences</span>
                </button>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <div className="mb-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <button 
                  className={`pb-2 px-1 ${selectedView === 'campaigns' 
                    ? 'border-b-2 border-primary text-primary font-medium' 
                    : 'text-gray-600'}`}
                  onClick={() => setSelectedView('campaigns')}
                >
                  Campaigns
                </button>
                <button 
                  className={`pb-2 px-1 ${selectedView === 'adSets' 
                    ? 'border-b-2 border-primary text-primary font-medium' 
                    : 'text-gray-600'}`}
                  onClick={() => setSelectedView('adSets')}
                >
                  Ad Sets
                </button>
                <button 
                  className={`pb-2 px-1 ${selectedView === 'ads' 
                    ? 'border-b-2 border-primary text-primary font-medium' 
                    : 'text-gray-600'}`}
                  onClick={() => setSelectedView('ads')}
                >
                  Ads
                </button>
                <button 
                  className={`pb-2 px-1 ${selectedView === 'audiences' 
                    ? 'border-b-2 border-primary text-primary font-medium' 
                    : 'text-gray-600'}`}
                  onClick={() => setSelectedView('audiences')}
                >
                  Audiences
                </button>
              </div>
            </div>
          )}
          
          {/* Search & Filter - Mobile Compact Version */}
          <div className={`flex flex-col ${isMobile ? 'gap-2 mb-3' : 'md:flex-row gap-4 mb-6'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            {!isMobile && (
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1 h-9 text-xs">
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
                
                <Button variant="outline" className="gap-1 h-9 text-xs">
                  <TableIcon className="h-3 w-3" />
                  Columns
                </Button>
                
                <Button variant="outline" className="gap-1 h-9 text-xs">
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
            )}
            
            {isMobile && (
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1 h-8 text-xs flex-1">
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-8 w-8 p-0">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[40vh]">
                    <div className="pt-6 space-y-4">
                      <button className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 rounded-md">
                        <TableIcon className="h-4 w-4" />
                        <span>Edit Columns</span>
                      </button>
                      <button className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 rounded-md">
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                      </button>
                      <button className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 rounded-md">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="all" className="mb-3" onValueChange={setActiveTab}>
            <TabsList className={`grid ${isMobile ? 'grid-cols-3 text-xs' : 'grid-cols-3'}`}>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {selectedCampaigns.length > 0 && (
            <div className={`flex gap-2 mb-3 p-2 bg-gray-50 rounded-md ${isMobile ? 'flex-wrap' : ''}`}>
              <span className={`text-xs font-medium flex-1 flex items-center ${isMobile ? 'w-full mb-1' : ''}`}>
                {selectedCampaigns.length} selected
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleStatusChange(selectedCampaigns[0], "active")}>
                <Eye className="h-3 w-3 mr-1" /> Activate
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleStatusChange(selectedCampaigns[0], "inactive")}>
                <EyeOff className="h-3 w-3 mr-1" /> Pause
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-red-600" onClick={() => handleDeleteCampaign(selectedCampaigns[0])}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          )}
          
          {/* Add bottom padding for mobile to account for fixed bottom nav */}
          <div className={isMobile ? "pb-16" : ""}>
            {selectedView === 'campaigns' && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="h-4 w-4"
                        />
                      </TableHead>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>{isMobile ? 'Name' : 'Campaign'}</TableHead>
                      {!isMobile && <TableHead>Objective</TableHead>}
                      <TableHead>Budget</TableHead>
                      <TableHead className="text-right">Results</TableHead>
                      {!isMobile && <TableHead className="hidden md:table-cell text-right">Reach</TableHead>}
                      {!isMobile && <TableHead className="hidden lg:table-cell text-right">Impressions</TableHead>}
                      {!isMobile && <TableHead className="text-right">Cost per Result</TableHead>}
                      <TableHead>Status</TableHead>
                      {!isMobile && <TableHead className="hidden md:table-cell">Dates</TableHead>}
                      <TableHead className="text-right">{isMobile ? '' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <>
                          <TableRow key={campaign.id} className={expandedCampaigns.includes(campaign.id) ? "bg-gray-50" : ""}>
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <Checkbox 
                                checked={selectedCampaigns.includes(campaign.id)} 
                                onCheckedChange={() => handleSelectCampaign(campaign.id)}
                                className="h-4 w-4" 
                              />
                            </TableCell>
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <button 
                                onClick={() => toggleCampaignExpansion(campaign.id)}
                                className="w-5 h-5 flex items-center justify-center"
                              >
                                {expandedCampaigns.includes(campaign.id) ? "-" : "+"}
                              </button>
                            </TableCell>
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <div>
                                <p className={`${isMobile ? "text-sm" : "font-medium"}`}>{campaign.name}</p>
                                {!isMobile && <p className="text-xs text-gray-500">ID: {campaign.id}</p>}
                              </div>
                            </TableCell>
                            {!isMobile && <TableCell>{campaign.objective}</TableCell>}
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <div>
                                <p className={isMobile ? "text-sm" : ""}>${campaign.budget.amount.toFixed(2)}</p>
                                {!isMobile && <p className="text-xs text-gray-500">{campaign.budget.type}</p>}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${isMobile ? "p-2" : ""}`}>{campaign.results}</TableCell>
                            {!isMobile && <TableCell className="hidden md:table-cell text-right">{campaign.reach.toLocaleString()}</TableCell>}
                            {!isMobile && <TableCell className="hidden lg:table-cell text-right">{campaign.impressions.toLocaleString()}</TableCell>}
                            {!isMobile && <TableCell className="text-right">${campaign.cost.toFixed(2)}</TableCell>}
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <StatusBadge status={campaign.status} />
                            </TableCell>
                            {!isMobile && (
                              <TableCell className="hidden md:table-cell">
                                <div className="text-xs">
                                  <p>Start: {campaign.startDate}</p>
                                  <p>End: {campaign.endDate}</p>
                                </div>
                              </TableCell>
                            )}
                            <TableCell className={`text-right ${isMobile ? "p-2" : ""}`}>
                              {isMobile ? (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              ) : (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDuplicateCampaign(campaign.id)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <BarChart className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                          
                          {expandedCampaigns.includes(campaign.id) && campaign.adSets.map((adSet) => (
                            <TableRow key={adSet.id} className="bg-gray-50 text-sm">
                              <TableCell className={isMobile ? "p-2" : ""}></TableCell>
                              <TableCell className={isMobile ? "p-2" : ""}></TableCell>
                              <TableCell colSpan={isMobile ? 1 : 2} className={isMobile ? "p-2" : ""}>
                                <div className="pl-4 border-l-2 border-gray-300">
                                  <p className={`${isMobile ? "text-xs" : "font-medium"}`}>{adSet.name}</p>
                                  {!isMobile && <p className="text-xs text-gray-500">ID: {adSet.id}</p>}
                                </div>
                              </TableCell>
                              <TableCell className={isMobile ? "p-2" : ""}>${adSet.budget.toFixed(2)}</TableCell>
                              <TableCell className={`text-right ${isMobile ? "p-2" : ""}`}>{adSet.results}</TableCell>
                              {!isMobile && <TableCell className="hidden md:table-cell text-right">{adSet.reach.toLocaleString()}</TableCell>}
                              {!isMobile && <TableCell className="hidden lg:table-cell text-right">{adSet.impressions.toLocaleString()}</TableCell>}
                              {!isMobile && <TableCell className="text-right">${adSet.cost.toFixed(2)}</TableCell>}
                              <TableCell className={isMobile ? "p-2" : ""}>
                                <StatusBadge status={adSet.status} />
                              </TableCell>
                              {!isMobile && (
                                <TableCell className="hidden md:table-cell">
                                  <p className="text-xs">{adSet.schedule}</p>
                                </TableCell>
                              )}
                              <TableCell className={`text-right ${isMobile ? "p-2" : ""}`}>
                                {isMobile ? (
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                          No campaigns found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {selectedView === 'adSets' && (
              <div className="rounded-md border p-8 text-center">
                <h3 className="text-lg font-medium text-gray-600">Ad Sets View</h3>
                <p className="text-gray-500 mt-2">This view would display all ad sets across your campaigns</p>
              </div>
            )}
            
            {selectedView === 'ads' && (
              <div className="rounded-md border p-8 text-center">
                <h3 className="text-lg font-medium text-gray-600">Ads View</h3>
                <p className="text-gray-500 mt-2">This view would display all individual ads</p>
              </div>
            )}
            
            {selectedView === 'audiences' && (
              <div className="rounded-md border p-8 text-center">
                <h3 className="text-lg font-medium text-gray-600">Audiences View</h3>
                <p className="text-gray-500 mt-2">This view would display all your custom and saved audiences</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Ads;
