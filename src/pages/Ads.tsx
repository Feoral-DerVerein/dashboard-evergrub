import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Eye, Target, TrendingUp, PiggyBank, BarChart3, Settings } from 'lucide-react';
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
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AdPerformancePredictor from '@/components/ads/AdPerformancePredictor';
import { adsService, type Ad, type AdCampaign } from '@/services/adsService';

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'active': 'default',
    'draft': 'secondary', 
    'paused': 'outline',
    'completed': 'outline',
    'rejected': 'destructive'
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
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
  
  const isMobile = useIsMobile();
  const { user } = useAuthContext();
  const { toast } = useToast();

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
          description: "No se pudieron cargar los datos de publicidad",
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

  const handleCreateAd = async () => {
    if (!user || !newAd.title) {
      toast({
        title: "Error",
        description: "Título es requerido",
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
        title: "Éxito",
        description: "Anuncio creado exitosamente"
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el anuncio",
        variant: "destructive"
      });
    }
  };

  const stats = calculateSummaryStats();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <header className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Publicidad</h1>
          
          <div className="flex gap-2">
            <Dialog open={showCreateAdDialog} onOpenChange={setShowCreateAdDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear anuncio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear nuevo anuncio</DialogTitle>
                  <DialogDescription>
                    Crea un anuncio para mostrar en el marketplace de WiseBite
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ad-title">Título *</Label>
                    <Input
                      id="ad-title"
                      value={newAd.title}
                      onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título del anuncio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-description">Descripción</Label>
                    <Textarea
                      id="ad-description"
                      value={newAd.description}
                      onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del anuncio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-image">URL de imagen</Label>
                    <Input
                      id="ad-image"
                      value={newAd.image_url}
                      onChange={(e) => setNewAd(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-url">URL de destino</Label>
                    <Input
                      id="ad-url"
                      value={newAd.target_url}
                      onChange={(e) => setNewAd(prev => ({ ...prev, target_url: e.target.value }))}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad-budget">Presupuesto total</Label>
                      <Input
                        id="ad-budget"
                        type="number"
                        value={newAd.budget}
                        onChange={(e) => setNewAd(prev => ({ ...prev, budget: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ad-daily-budget">Presupuesto diario</Label>
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
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAd}>
                    Crear anuncio
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
                <CardTitle className="text-sm font-medium">Alcance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Impresiones</CardTitle>
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
                <CardTitle className="text-sm font-medium">CPC Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.avgCost.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
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
                placeholder="Buscar anuncios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="draft">Borrador</TabsTrigger>
              <TabsTrigger value="paused">Pausados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Anuncio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Presupuesto</TableHead>
                      <TableHead>Gastado</TableHead>
                      <TableHead>Impresiones</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>CTR</TableHead>
                      <TableHead>CPC</TableHead>
                      <TableHead>Acciones</TableHead>
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
                               ad.ad_type === 'sidebar' ? 'Barra lateral' : 'Popup'}
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
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No hay anuncios que coincidan con los filtros actuales
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