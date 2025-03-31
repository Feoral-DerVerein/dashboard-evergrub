
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
  BarChart
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

// Mock data for demonstration
const mockAds = [
  {
    id: "1",
    title: "Premium Coffee Blends",
    description: "Specialty coffee from around the world",
    price: 24.99,
    category: "Food & Drinks",
    subcategory: "Coffee",
    location: "Miami, FL",
    status: "active",
    publishDate: "2023-10-15",
    expirationDate: "2023-12-15",
    views: 243,
    clicks: 45,
    saves: 12
  },
  {
    id: "2",
    title: "Handmade Ceramic Mugs",
    description: "Artisan crafted mugs perfect for your coffee",
    price: 29.99,
    category: "Home & Kitchen",
    subcategory: "Tableware",
    location: "New York, NY",
    status: "inactive",
    publishDate: "2023-09-20",
    expirationDate: "2023-11-20",
    views: 187,
    clicks: 32,
    saves: 8
  },
  {
    id: "3",
    title: "Coffee Equipment Bundle",
    description: "Complete setup for home baristas",
    price: 149.99,
    category: "Appliances",
    subcategory: "Coffee Makers",
    location: "Seattle, WA",
    status: "pending",
    publishDate: "2023-10-25",
    expirationDate: "2023-12-25",
    views: 0,
    clicks: 0,
    saves: 0
  },
];

const AdStatusBadge = ({ status }: { status: string }) => {
  let colorClass = "";
  
  switch (status) {
    case "active":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "inactive":
      colorClass = "bg-gray-100 text-gray-800";
      break;
    case "pending":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "rejected":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "sold":
    case "rented":
      colorClass = "bg-purple-100 text-purple-800";
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
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  
  const filteredAds = mockAds.filter(ad => {
    const matchesSearch = 
      searchTerm === "" || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = 
      activeTab === "all" || 
      ad.status === activeTab;
      
    return matchesSearch && matchesTab;
  });
  
  const handleSelectAd = (adId: string) => {
    setSelectedAds(prev => {
      if (prev.includes(adId)) {
        return prev.filter(id => id !== adId);
      } else {
        return [...prev, adId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedAds.length === filteredAds.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(filteredAds.map(ad => ad.id));
    }
  };
  
  const handleStatusChange = (adId: string, newStatus: string) => {
    // In a real app, this would make an API call to update the ad status
    toast.success(`Ad status changed to ${newStatus}`);
  };
  
  const handleDeleteAd = (adId: string) => {
    // In a real app, this would make an API call to delete the ad
    toast.success("Ad deleted successfully");
  };
  
  const handleDuplicateAd = (adId: string) => {
    // In a real app, this would make an API call to duplicate the ad
    toast.success("Ad duplicated successfully");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white min-h-screen animate-fade-in pb-20">
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Manage Ads</h1>
          </div>
          
          <Link to="/ads/create">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Create New Ad
            </Button>
          </Link>
        </header>
        
        {/* Main Content */}
        <main className="p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ads by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
          
          {/* Tabs - Removed "pending" and "rejected" tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Bulk Actions */}
          {selectedAds.length > 0 && (
            <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium flex-1">
                {selectedAds.length} ad(s) selected
              </span>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedAds[0], "active")}>
                <Eye className="h-4 w-4 mr-1" /> Activate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(selectedAds[0], "inactive")}>
                <EyeOff className="h-4 w-4 mr-1" /> Deactivate
              </Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteAd(selectedAds[0])}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}
          
          {/* Ads Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedAds.length === filteredAds.length && filteredAds.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Ad Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.length > 0 ? (
                  filteredAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedAds.includes(ad.id)} 
                          onChange={() => handleSelectAd(ad.id)} 
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {ad.description}
                          </p>
                          <div className="flex flex-col md:flex-row md:gap-2 text-xs text-gray-500 mt-1">
                            <span>Published: {ad.publishDate}</span>
                            <span>Expires: {ad.expirationDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${ad.price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm">{ad.category}</p>
                          <p className="text-xs text-gray-500">{ad.subcategory}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{ad.location}</TableCell>
                      <TableCell>
                        <AdStatusBadge status={ad.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-xs">
                          <p>{ad.views} views</p>
                          <p>{ad.clicks} clicks</p>
                          <p>{ad.saves} saves</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDuplicateAd(ad.id)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <BarChart className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No ads found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Ads;
