
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
  ChevronDown,
  ChevronRight,
  Share2,
  MoreHorizontal
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
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import AdPerformancePredictor from "@/components/ads/AdPerformancePredictor";

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
  let variant = "outline";
  
  switch (status) {
    case "active":
      variant = "success";
      break;
    case "inactive":
      variant = "secondary";
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge variant={variant} className="text-xs font-medium">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const Ads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedView, setSelectedView] = useState("campaigns");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("last30days");
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);
  const [showAdPredictor, setShowAdPredictor] = useState(false);
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
    toast({
      title: "Status Updated",
      description: `Campaign status changed to ${newStatus}`,
      variant: "default",
    });
  };
  
  const handleDeleteCampaign = (campaignId: string) => {
    toast({
      title: "Campaign Deleted",
      description: "Campaign deleted successfully",
      variant: "default",
    });
  };
  
  const handleDuplicateCampaign = (campaignId: string) => {
    toast({
      title: "Campaign Duplicated",
      description: "Campaign duplicated successfully",
      variant: "default",
    });
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto bg-white min-h-screen animate-fade-in pb-20 shadow-sm">
        {/* Header */}
        <header className="px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Ad Campaigns</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
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
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
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
              <Button size="sm" className="h-9 gap-1 shadow-sm">
                <Plus className="h-4 w-4" />
                <span className={isMobile ? "hidden" : "inline"}>Create Campaign</span>
              </Button>
            </Link>

            <Button 
              variant="outline" 
              size="sm" 
              className={`h-9 gap-1 ${!isMobile ? "ml-1" : ""}`}
              onClick={() => setShowAdPredictor(!showAdPredictor)}
            >
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Performance Predictor</span>
            </Button>
          </div>
        </header>
        
        <main className="p-4 space-y-5">
          {/* Stats Overview Cards */}
          <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"}`}>
            <Card className="shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-muted-foreground font-normal">Reach</CardTitle>
                <Users className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <p className="text-lg font-semibold">{totalReach.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total audience reach</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-muted-foreground font-normal">Impressions</CardTitle>
                <Eye className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <p className="text-lg font-semibold">{totalImpressions.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total ad views</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-muted-foreground font-normal">Results</CardTitle>
                <MousePointerClick className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <p className="text-lg font-semibold">{totalResults}</p>
                <p className="text-[10px] text-muted-foreground">Conversions & clicks</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-muted-foreground font-normal">Cost/Result</CardTitle>
                <CircleDollarSign className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <p className="text-lg font-semibold">${averageCost.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Average cost per result</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-card to-background">
              <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-muted-foreground font-normal">Total Spend</CardTitle>
                <Banknote className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-4">
                <p className="text-lg font-semibold">${totalSpend.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Estimated 30-day spend</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Predictor (Collapsible) */}
          {showAdPredictor && (
            <div className="mb-5 animate-fade-in">
              <AdPerformancePredictor />
            </div>
          )}
          
          {/* View Selector - Desktop Only */}
          {!isMobile && (
            <div className="mb-2">
              <div className="inline-flex rounded-md shadow-sm bg-gray-50/80">
                <button 
                  className={`px-4 py-2 text-sm ${selectedView === 'campaigns' 
                    ? 'bg-white rounded-l-md shadow-sm font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setSelectedView('campaigns')}
                >
                  Campaigns
                </button>
                <button 
                  className={`px-4 py-2 text-sm ${selectedView === 'adSets' 
                    ? 'bg-white shadow-sm font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setSelectedView('adSets')}
                >
                  Ad Sets
                </button>
                <button 
                  className={`px-4 py-2 text-sm ${selectedView === 'ads' 
                    ? 'bg-white shadow-sm font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setSelectedView('ads')}
                >
                  Ads
                </button>
                <button 
                  className={`px-4 py-2 text-sm ${selectedView === 'audiences' 
                    ? 'bg-white rounded-r-md shadow-sm font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setSelectedView('audiences')}
                >
                  Audiences
                </button>
              </div>
            </div>
          )}
          
          {/* Search & Filter Bar */}
          <div className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row'} justify-between`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-gray-50/50 border-gray-200"
              />
            </div>
            
            {!isMobile && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 h-9 bg-gray-50/50 border-gray-200">
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                </Button>
                
                <Button variant="outline" size="sm" className="gap-1 h-9 bg-gray-50/50 border-gray-200">
                  <TableIcon className="h-3.5 w-3.5" />
                  Columns
                </Button>
                
                <Button variant="outline" size="sm" className="gap-1 h-9 bg-gray-50/50 border-gray-200">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            )}
            
            {isMobile && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 h-8 text-xs flex-1">
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-1" onValueChange={setActiveTab}>
            <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3 w-[300px]'}`}>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Bulk Action Bar */}
          {selectedCampaigns.length > 0 && (
            <div className={`flex gap-2 mb-3 p-2 bg-gray-50 rounded-md items-center ${isMobile ? 'flex-wrap' : ''}`}>
              <span className={`text-xs font-medium flex items-center ${isMobile ? 'w-full mb-1' : ''}`}>
                {selectedCampaigns.length} selected
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleStatusChange(selectedCampaigns[0], "active")}>
                <Eye className="h-3 w-3 mr-1" /> Activate
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => handleStatusChange(selectedCampaigns[0], "inactive")}>
                <EyeOff className="h-3 w-3 mr-1" /> Pause
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCampaign(selectedCampaigns[0])}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          )}
          
          {/* Campaign Table */}
          <div>
            {selectedView === 'campaigns' && (
              <div className="rounded-lg border border-gray-100 overflow-hidden shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-gray-50/80">
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
                      {!isMobile && <TableHead className="text-right">Cost</TableHead>}
                      <TableHead>Status</TableHead>
                      {!isMobile && <TableHead className="hidden md:table-cell">Dates</TableHead>}
                      <TableHead className="text-right">{isMobile ? '' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <>
                          <TableRow key={campaign.id} className={`${expandedCampaigns.includes(campaign.id) ? "bg-gray-50/50" : "hover:bg-gray-50/30"} border-b border-gray-100`}>
                            <TableCell className={`${isMobile ? "p-2" : ""} align-middle`}>
                              <Checkbox 
                                checked={selectedCampaigns.includes(campaign.id)} 
                                onCheckedChange={() => handleSelectCampaign(campaign.id)}
                                className="h-4 w-4" 
                              />
                            </TableCell>
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <button 
                                onClick={() => toggleCampaignExpansion(campaign.id)}
                                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                              >
                                {expandedCampaigns.includes(campaign.id) ? 
                                  <ChevronDown className="h-4 w-4" /> : 
                                  <ChevronRight className="h-4 w-4" />}
                              </button>
                            </TableCell>
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <div>
                                <p className={`${isMobile ? "text-sm" : "font-medium"} line-clamp-1`}>
                                  {campaign.name}
                                </p>
                                {!isMobile && <p className="text-xs text-gray-500">ID: {campaign.id}</p>}
                              </div>
                            </TableCell>
                            {!isMobile && <TableCell>{campaign.objective}</TableCell>}
                            <TableCell className={isMobile ? "p-2" : ""}>
                              <div>
                                <p className={isMobile ? "text-sm" : ""}>${campaign.budget.amount.toFixed(2)}</p>
                                {!isMobile && <p className="text-xs text-gray-500 capitalize">{campaign.budget.type}</p>}
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
                                  <p>{campaign.startDate}</p>
                                  <p className="text-muted-foreground">{campaign.endDate}</p>
                                </div>
                              </TableCell>
                            )}
                            <TableCell className={`text-right ${isMobile ? "p-2" : ""}`}>
                              {isMobile ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36">
                                    <DropdownMenuItem className="flex items-center">
                                      <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center" onClick={() => handleDuplicateCampaign(campaign.id)}>
                                      <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center">
                                      <BarChart className="h-3.5 w-3.5 mr-2" /> Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center text-destructive">
                                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDuplicateCampaign(campaign.id)} title="Duplicate">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Analytics">
                                    <BarChart className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Settings">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                          
                          {expandedCampaigns.includes(campaign.id) && campaign.adSets.map((adSet) => (
                            <TableRow key={adSet.id} className="bg-gray-50/30 border-b border-gray-100">
                              <TableCell className={isMobile ? "p-2" : ""}></TableCell>
                              <TableCell className={isMobile ? "p-2" : ""}></TableCell>
                              <TableCell colSpan={isMobile ? 1 : 2} className={isMobile ? "p-2" : ""}>
                                <div className="pl-4 border-l-2 border-gray-300">
                                  <p className={`${isMobile ? "text-xs" : "text-sm font-medium"}`}>{adSet.name}</p>
                                  {!isMobile && <p className="text-xs text-gray-500">ID: {adSet.id}</p>}
                                </div>
                              </TableCell>
                              <TableCell className={isMobile ? "p-2" : ""}>
                                <p className="text-sm">${adSet.budget.toFixed(2)}</p>
                              </TableCell>
                              <TableCell className={`text-right ${isMobile ? "p-2" : ""}`}>
                                {adSet.results}
                              </TableCell>
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
                                    <Edit className="h-3.5 w-3.5" />
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
              <Card className="shadow-sm">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <TableIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Ad Sets View</h3>
                  <p className="text-gray-500 max-w-md text-center">
                    View and manage all your ad sets across campaigns. This view allows for deeper analysis of performance by audience segment.
                  </p>
                  <Button className="mt-4">View Ad Sets</Button>
                </div>
              </Card>
            )}
            
            {selectedView === 'ads' && (
              <Card className="shadow-sm">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <LineChart className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Ads View</h3>
                  <p className="text-gray-500 max-w-md text-center">
                    Review individual ad performance, creative elements, and targeting effectiveness in one consolidated view.
                  </p>
                  <Button className="mt-4">View Ads</Button>
                </div>
              </Card>
            )}
            
            {selectedView === 'audiences' && (
              <Card className="shadow-sm">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Audiences View</h3>
                  <p className="text-gray-500 max-w-md text-center">
                    Manage your saved audiences, create new audience segments, and analyze audience overlap and performance.
                  </p>
                  <Button className="mt-4">View Audiences</Button>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Ads;
