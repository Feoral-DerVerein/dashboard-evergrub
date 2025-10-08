import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plug, Square, Zap, Utensils, Sparkles } from "lucide-react";

type POSType = 'square' | 'lightspeed' | 'toast' | 'clover';

const posOptions = [
  {
    id: 'square' as POSType,
    title: 'Square',
    description: 'Leading POS system for retail and restaurants',
    badge: 'Popular',
    icon: Square,
    color: 'text-blue-600',
    available: true,
  },
  {
    id: 'lightspeed' as POSType,
    title: 'Lightspeed',
    description: 'Complete POS for stores and restaurants',
    badge: null,
    icon: Zap,
    color: 'text-orange-600',
    available: true,
  },
  {
    id: 'toast' as POSType,
    title: 'Toast',
    description: 'POS specialized for restaurants',
    badge: 'Coming Soon',
    icon: Utensils,
    color: 'text-red-600',
    available: false,
  },
  {
    id: 'clover' as POSType,
    title: 'Clover',
    description: 'Flexible POS for all business types',
    badge: 'Coming Soon',
    icon: Sparkles,
    color: 'text-green-600',
    available: false,
  },
];

const ConnectPOS = () => {
  const [selectedPOS, setSelectedPOS] = useState<POSType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    apiKey: '',
  });

  const handleConnectClick = (pos: typeof posOptions[0]) => {
    if (!pos.available) {
      toast.info('Coming soon', {
        description: `${pos.title} integration will be available soon.`,
      });
      return;
    }
    setSelectedPOS(pos.id);
    setIsDialogOpen(true);
  };

  const handleConnect = async () => {
    if (!formData.businessName || !formData.apiKey) {
      toast.error('Please fill in all fields');
      return;
    }

    // TODO: Implement actual POS connection logic
    toast.success('POS Connected', {
      description: `Successfully connected to ${selectedPOS}`,
    });
    
    setIsDialogOpen(false);
    setFormData({ businessName: '', apiKey: '' });
  };

  const selectedPOSData = posOptions.find(pos => pos.id === selectedPOS);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connect POS System</h1>
        <p className="text-muted-foreground">
          Integrate your point of sale system to automatically sync inventory and sales
        </p>
      </div>

      {/* POS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posOptions.map((pos) => {
          const Icon = pos.icon;
          return (
            <Card 
              key={pos.id}
              className="relative hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${pos.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{pos.title}</CardTitle>
                    </div>
                  </div>
                  {pos.badge && (
                    <Badge 
                      variant={pos.badge === 'Popular' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {pos.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-3">
                  {pos.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => handleConnectClick(pos)}
                  disabled={!pos.available}
                  className="w-full"
                  variant={pos.available ? 'default' : 'outline'}
                >
                  <Plug className="mr-2 h-4 w-4" />
                  Connect {pos.title}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect to {selectedPOSData?.title}</DialogTitle>
            <DialogDescription>
              Enter your {selectedPOSData?.title} credentials to sync your data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Find your API key in your {selectedPOSData?.title} dashboard settings
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectPOS;
