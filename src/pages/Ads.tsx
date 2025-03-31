
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
  Share2
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

// Mock data for demonstration
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

// Status badge component
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
    // In a real app, this would make an API call to update the campaign status
    toast.success(`Campaign status changed to ${newStatus}`);
  };
  
  const handleDeleteCampaign = (campaignId: string) => {
    // In a real app, this would make an API call to delete the campaign
    toast.success("Campaign deleted successfully");
  };
  
  const handleDuplicateCampaign = (campaignId: string) => {
    // In a real app, this would make an API call to duplicate the campaign
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
  
  // Performance metrics summary
  const totalReach = mockCampaigns.reduce((sum, campaign) => sum + campaign.reach, 0);
  const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalResults = mockCampaigns.reduce((sum, campaign) => sum + campaign.results, 0);
  const averageCost = mockCampaigns.reduce((sum, campaign) => sum + campaign.cost, 0) / mockCampaigns.length;
  const totalSpend = mockCampaigns.reduce((sum, campaign) => {
    if (campaign.budget.type === "daily") {
      // Assuming 30 days for simplicity
      return sum + (campaign.budget.amount * 30);
    } else {
      return sum + campaign.budget.amount;
    }
  }, 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white min-h-screen animate-fade-in pb-20">
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Ads Manager</h1>
          </div>
          
          <div className="flex items-center gap-3">
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
            
            <Link to="/ads/create">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Create New Campaign
              </Button>
            </Link>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6">
          {/* Performance Overview */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Performance Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-normal flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{totalReach.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-normal flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{totalImpressions.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-normal flex items-center">
                    <MousePointerClick className="h-4 w-4 mr-1" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{totalResults}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-normal flex items-center">
                    <CircleDollarSign className="h-4 w-4 mr-1" />
                    Cost per Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">${averageCost.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 font-normal flex items-center">
                    <Banknote className="h-4 w-4 mr-1" />
                    Total Spend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">${totalSpend.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Tabs for View Selection */}
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
          
          {/* Tools Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <Button variant="outline" className="gap-2">
                <TableIcon className="h-4 w-4" />
                Columns
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Status Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Bulk Actions */}
          {selectedCampaigns.length > 0 && (
            <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium flex-1">
                {selectedCampaigns.length} campaign(s) selected
              </span>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedCampaigns[0], "active")}>
                <Eye className="h-4 w-4 mr-1" /> Activate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedCampaigns[0], "inactive")}>
                <EyeOff className="h-4 w-4 mr-1" /> Pause
              </Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCampaign(selectedCampaigns[0])}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}
          
          {/* Campaigns Table */}
          {selectedView === 'campaigns' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Objective</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Results</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Reach</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Impressions</TableHead>
                    <TableHead className="text-right">Cost per Result</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <>
                        <TableRow key={campaign.id} className={expandedCampaigns.includes(campaign.id) ? "bg-gray-50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedCampaigns.includes(campaign.id)} 
                              onCheckedChange={() => handleSelectCampaign(campaign.id)} 
                            />
                          </TableCell>
                          <TableCell>
                            <button 
                              onClick={() => toggleCampaignExpansion(campaign.id)}
                              className="w-6 h-6 flex items-center justify-center"
                            >
                              {expandedCampaigns.includes(campaign.id) ? "-" : "+"}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-xs text-gray-500">ID: {campaign.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>{campaign.objective}</TableCell>
                          <TableCell>
                            <div>
                              <p>${campaign.budget.amount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{campaign.budget.type}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{campaign.results}</TableCell>
                          <TableCell className="hidden md:table-cell text-right">{campaign.reach.toLocaleString()}</TableCell>
                          <TableCell className="hidden lg:table-cell text-right">{campaign.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${campaign.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <StatusBadge status={campaign.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-xs">
                              <p>Start: {campaign.startDate}</p>
                              <p>End: {campaign.endDate}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
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
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded AdSets if campaign is expanded */}
                        {expandedCampaigns.includes(campaign.id) && campaign.adSets.map((adSet) => (
                          <TableRow key={adSet.id} className="bg-gray-50 text-sm">
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell colSpan={2}>
                              <div className="pl-4 border-l-2 border-gray-300">
                                <p className="font-medium">{adSet.name}</p>
                                <p className="text-xs text-gray-500">ID: {adSet.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>${adSet.budget.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{adSet.results}</TableCell>
                            <TableCell className="hidden md:table-cell text-right">{adSet.reach.toLocaleString()}</TableCell>
                            <TableCell className="hidden lg:table-cell text-right">{adSet.impressions.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${adSet.cost.toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusBadge status={adSet.status} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-xs">{adSet.schedule}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
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
          
          {/* Placeholder for other views */}
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
        </main>
      </div>
    </div>
  );
};

export default Ads;
