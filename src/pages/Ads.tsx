import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Eye, Target, TrendingUp, PiggyBank, BarChart3, Settings, Upload, X, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AdPerformancePredictor from '@/components/ads/AdPerformancePredictor';
import { adsService, type Ad, type AdCampaign } from '@/services/adsService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'paused':
      case 'completed':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  return (
    <Badge variant={getVariant(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const Ads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedView, setSelectedView] = useState('campaigns');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('7d');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAdDialog, setShowCreateAdDialog] = useState(false);
  const [showCreateCampaignDialog, setShowCreateCampaignDialog] = useState(false);
  const [showEditAdDialog, setShowEditAdDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [newAd, setNewAd] = useState<Partial<Ad>>({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    budget: 0,
    daily_budget: 0,
    ad_type: 'banner',
    status: 'draft'
  });
  const [newCampaign, setNewCampaign] = useState<Partial<AdCampaign>>({
    name: '',
    objective: 'awareness',
    budget: 0,
    status: 'draft'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [campaignsData, adsData] = await Promise.all([
          adsService.getUserCampaigns(user.id),
          adsService.getUserAds(user.id)
        ]);
        
        setCampaigns(campaignsData);
        setAds(adsData);
      } catch (error) {
        console.error('Error loading ads data:', error);
        toast({
          title: "Error",
          description: "Could not load advertising data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || campaign.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || ad.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const calculateSummaryStats = () => {
    if (selectedView === 'campaigns') {
      const totalReach = filteredCampaigns.reduce((sum, campaign) => sum + (campaign.total_spent * 100), 0);
      const totalImpressions = ads
        .filter(ad => filteredCampaigns.some(c => c.id === ad.campaign_id))
        .reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = ads
        .filter(ad => filteredCampaigns.some(c => c.id === ad.campaign_id))
        .reduce((sum, ad) => sum + ad.clicks, 0);
      const totalSpent = filteredCampaigns.reduce((sum, campaign) => sum + campaign.total_spent, 0);
      const avgCost = totalClicks > 0 ? totalSpent / totalClicks : 0;
      
      return { totalReach, totalImpressions, totalClicks, avgCost, totalSpent };
    } else {
      const totalReach = filteredAds.reduce((sum, ad) => sum + (ad.total_spent * 100), 0);
      const totalImpressions = filteredAds.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = filteredAds.reduce((sum, ad) => sum + ad.clicks, 0);
      const totalSpent = filteredAds.reduce((sum, ad) => sum + ad.total_spent, 0);
      const avgCost = totalClicks > 0 ? totalSpent / totalClicks : 0;
      
      return { totalReach, totalImpressions, totalClicks, avgCost, totalSpent };
    }
  };

  const uploadImage = async (file: File, isEdit: boolean = false) => {
    if (!user) return null;
    
    const setUploading = isEdit ? setUploadingEditImage : setUploadingImage;
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Could not upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      if (isEdit) {
        setEditingAd(prev => prev ? ({ ...prev, image_url: imageUrl }) : null);
      } else {
        setNewAd(prev => ({ ...prev, image_url: imageUrl }));
      }
    }
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setShowEditAdDialog(true);
  };

  const handleUpdateAd = async () => {
    if (!editingAd || !editingAd.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedAd = await adsService.updateAd(editingAd.id, {
        title: editingAd.title,
        description: editingAd.description,
        image_url: editingAd.image_url,
        target_url: editingAd.target_url,
        budget: Number(editingAd.budget),
        daily_budget: Number(editingAd.daily_budget),
        ad_type: editingAd.ad_type,
        status: editingAd.status
      });

      setAds(prev => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
      setShowEditAdDialog(false);
      setEditingAd(null);
      
      toast({
        title: "Success",
        description: "Ad updated successfully"
      });
    } catch (error) {
      console.error('Error updating ad:', error);
      toast({
        title: "Error",
        description: "Could not update ad",
        variant: "destructive"
      });
    }
  };

  const handleCreateAd = async () => {
    if (!user || !newAd.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const adData = {
        ...newAd,
        user_id: user.id,
        budget: Number(newAd.budget) || 0,
        daily_budget: Number(newAd.daily_budget) || 0,
        total_spent: 0,
        impressions: 0,
        clicks: 0
      } as Omit<Ad, 'id' | 'created_at' | 'updated_at'>;

      const createdAd = await adsService.createAd(adData);
      setAds(prev => [createdAd, ...prev]);
      setShowCreateAdDialog(false);
      setNewAd({
        title: '',
        description: '',
        image_url: '',
        target_url: '',
        budget: 0,
        daily_budget: 0,
        ad_type: 'banner',
        status: 'draft'
      });
      
      toast({
        title: "Success",
        description: "Ad created successfully"
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: "Error",
        description: "Could not create ad",
        variant: "destructive"
      });
    }
  };

  const stats = calculateSummaryStats();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto glass-card min-h-screen">
        {/* Header */}
        <header className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold flex-1">Advertising</h1>
          
          <div className="flex gap-2">
            <Dialog open={showCreateAdDialog} onOpenChange={setShowCreateAdDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Ad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Ad</DialogTitle>
                  <DialogDescription>
                    Create an ad to display on the WiseBite marketplace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ad-title">Title *</Label>
                    <Input
                      id="ad-title"
                      value={newAd.title}
                      onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ad title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-description">Description</Label>
                    <Textarea
                      id="ad-description"
                      value={newAd.description}
                      onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ad description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-image">Banner Image</Label>
                    <div className="text-sm text-gray-500 mb-2">Recommended size: 728x90px or 300x250px for optimal display</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          id="ad-image-upload"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('ad-image-upload')?.click()}
                          disabled={uploadingImage}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </Button>
                        {newAd.image_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewAd(prev => ({ ...prev, image_url: '' }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {newAd.image_url && (
                        <div className="flex items-center gap-3">
                          <img 
                            src={newAd.image_url} 
                            alt="Ad preview"
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <div className="text-sm text-gray-600">
                            Image uploaded successfully
                          </div>
                        </div>
                      )}
                      <Input
                        placeholder="Or paste image URL here"
                        value={newAd.image_url}
                        onChange={(e) => setNewAd(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ad-url">Target URL</Label>
                    <Input
                      id="ad-url"
                      value={newAd.target_url}
                      onChange={(e) => setNewAd(prev => ({ ...prev, target_url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad-budget">Total Budget</Label>
                      <Input
                        id="ad-budget"
                        type="number"
                        value={newAd.budget}
                        onChange={(e) => setNewAd(prev => ({ ...prev, budget: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-daily-budget">Daily Budget</Label>
                      <Input
                        id="ad-daily-budget"
                        type="number"
                        value={newAd.daily_budget}
                        onChange={(e) => setNewAd(prev => ({ ...prev, daily_budget: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowCreateAdDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAd}>
                    Create Ad
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Ad Dialog */}
            <Dialog open={showEditAdDialog} onOpenChange={setShowEditAdDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Ad</DialogTitle>
                  <DialogDescription>
                    Update your ad details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-ad-title">Title *</Label>
                    <Input
                      id="edit-ad-title"
                      value={editingAd?.title || ''}
                      onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                      placeholder="Ad title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-description">Description</Label>
                    <Textarea
                      id="edit-ad-description"
                      value={editingAd?.description || ''}
                      onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                      placeholder="Ad description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-image">Banner Image</Label>
                    <div className="text-sm text-gray-500 mb-2">Recommended size: 728x90px or 300x250px for optimal display</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          id="edit-ad-image-upload"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('edit-ad-image-upload')?.click()}
                          disabled={uploadingEditImage}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingEditImage ? 'Uploading...' : 'Upload Image'}
                        </Button>
                        {editingAd?.image_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAd(prev => prev ? ({ ...prev, image_url: '' }) : null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {editingAd?.image_url && (
                        <div className="flex items-center gap-3">
                          <img 
                            src={editingAd.image_url} 
                            alt="Ad preview"
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <div className="text-sm text-gray-600">
                            Current ad image
                          </div>
                        </div>
                      )}
                      <Input
                        placeholder="Or paste image URL here"
                        value={editingAd?.image_url || ''}
                        onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, image_url: e.target.value }) : null)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-url">Target URL</Label>
                    <Input
                      id="edit-ad-url"
                      value={editingAd?.target_url || ''}
                      onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, target_url: e.target.value }) : null)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-ad-budget">Total Budget</Label>
                      <Input
                        id="edit-ad-budget"
                        type="number"
                        value={editingAd?.budget || 0}
                        onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, budget: Number(e.target.value) }) : null)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-ad-daily-budget">Daily Budget</Label>
                      <Input
                        id="edit-ad-daily-budget"
                        type="number"
                        value={editingAd?.daily_budget || 0}
                        onChange={(e) => setEditingAd(prev => prev ? ({ ...prev, daily_budget: Number(e.target.value) }) : null)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-status">Status</Label>
                    <Select 
                      value={editingAd?.status || 'draft'} 
                      onValueChange={(value) => setEditingAd(prev => prev ? ({ ...prev, status: value as Ad['status'] }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-ad-type">Ad Type</Label>
                    <Select 
                      value={editingAd?.ad_type || 'banner'} 
                      onValueChange={(value) => setEditingAd(prev => prev ? ({ ...prev, ad_type: value as Ad['ad_type'] }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowEditAdDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateAd}>
                    Update Ad
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        <main className="p-4 space-y-5">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average CPC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.avgCost.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>CPC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAds.length > 0 ? (
                      filteredAds.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {ad.image_url ? (
                                <img 
                                  src={ad.image_url} 
                                  alt={ad.title}
                                  className="w-8 h-8 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                  {ad.title.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{ad.title}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {ad.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ad.status} />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                               {ad.ad_type === 'banner' ? 'Banner' : 
                                ad.ad_type === 'sidebar' ? 'Sidebar' : 'Popup'}
                            </Badge>
                          </TableCell>
                          <TableCell>${ad.budget.toLocaleString()}</TableCell>
                          <TableCell>${ad.total_spent.toLocaleString()}</TableCell>
                          <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                          <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                          <TableCell>
                            {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%
                          </TableCell>
                          <TableCell>
                            ${ad.clicks > 0 ? (ad.total_spent / ad.clicks).toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleEditAd(ad)}>
                              <Settings className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No ads match the current filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Ads;