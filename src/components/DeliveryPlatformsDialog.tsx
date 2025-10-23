import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Truck, 
  Heart, 
  ExternalLink,
  Check,
  X,
  Link2,
  Loader2,
  ShoppingBag,
  Utensils,
  Package2,
  CircleDot
} from "lucide-react";
import { toast } from "sonner";

interface DeliveryPlatformsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Platform {
  id: string;
  name: string;
  type: "delivery" | "donation";
  icon: any;
  logoUrl: string;
  connected: boolean;
  description: string;
  color: string;
}

export function DeliveryPlatformsDialog({ open, onOpenChange }: DeliveryPlatformsDialogProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "ubereats",
      name: "Uber Eats",
      type: "delivery",
      icon: Utensils,
      logoUrl: "https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/97c43f8974e6c876.svg",
      connected: false,
      description: "Connect to send products directly to Uber Eats",
      color: "from-green-500 to-green-600"
    },
    {
      id: "doordash",
      name: "DoorDash",
      type: "delivery",
      icon: ShoppingBag,
      logoUrl: "https://cdn.doordash.com/static/img/doordash-logo-red.svg",
      connected: false,
      description: "Integrate with DoorDash for food delivery",
      color: "from-red-500 to-red-600"
    },
    {
      id: "grubhub",
      name: "GrubHub",
      type: "delivery",
      icon: Utensils,
      logoUrl: "https://res.cloudinary.com/grubhub/image/upload/v1623103257/Logos/Grubhub_Logo_2016.svg",
      connected: false,
      description: "Sell surplus food through GrubHub platform",
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "postmates",
      name: "Postmates",
      type: "delivery",
      icon: Package2,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Postmates_logo.svg",
      connected: false,
      description: "Send products via Postmates delivery",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: "deliveroo",
      name: "Deliveroo",
      type: "delivery",
      icon: Truck,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/00/Deliveroo_logo.svg",
      connected: false,
      description: "Connect to Deliveroo marketplace",
      color: "from-teal-500 to-teal-600"
    },
    {
      id: "foodpanda",
      name: "Foodpanda",
      type: "delivery",
      icon: ShoppingBag,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Foodpanda_logo.svg",
      connected: false,
      description: "Expand reach with Foodpanda delivery",
      color: "from-pink-500 to-pink-600"
    },
    {
      id: "feeding-america",
      name: "Feeding America",
      type: "donation",
      icon: Heart,
      logoUrl: "https://www.feedingamerica.org/themes/custom/feed_america/images/FA_Logo_Primary-tagline_CMYK.svg",
      connected: false,
      description: "Donate surplus food to those in need",
      color: "from-red-500 to-rose-600"
    },
    {
      id: "foodbank-nyc",
      name: "Food Bank NYC",
      type: "donation",
      icon: Heart,
      logoUrl: "https://www.foodbanknyc.org/wp-content/themes/foodbank/img/fbnyc-logo-white-text.svg",
      connected: false,
      description: "Support New York City food bank network",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "second-harvest",
      name: "Second Harvest",
      type: "donation",
      icon: Heart,
      logoUrl: "https://www.shfb.org/wp-content/uploads/2021/06/SHFB-logo-2021-horizontal-fullcolor.svg",
      connected: false,
      description: "Contribute to Second Harvest food rescue",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "local-foodbank",
      name: "Local Food Banks",
      type: "donation",
      icon: Heart,
      logoUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
      connected: false,
      description: "Connect with local community food banks",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: "food-rescue",
      name: "Food Rescue US",
      type: "donation",
      icon: Heart,
      logoUrl: "https://foodrescue.us/wp-content/uploads/2021/03/food-rescue-us-logo.svg",
      connected: false,
      description: "Partner with Food Rescue organizations",
      color: "from-emerald-500 to-emerald-600"
    },
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setConnectingId(platformId);

    // Simulate OAuth flow
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        setPlatforms(prev => 
          prev.map(p => 
            p.id === platformId 
              ? { ...p, connected: true }
              : p
          )
        );
        toast.success(`Successfully connected to ${platform.name}`, {
          description: "You can now send products to this platform"
        });
      } else {
        throw new Error("OAuth authentication failed");
      }
    } catch (error) {
      toast.error(`Failed to connect to ${platform.name}`, {
        description: "Please check your credentials and try again"
      });
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false }
          : p
      )
    );
    
    toast.info(`Disconnected from ${platform.name}`);
  };

  const deliveryPlatforms = platforms.filter(p => p.type === "delivery");
  const donationPlatforms = platforms.filter(p => p.type === "donation");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery & Donation Platforms</DialogTitle>
          <DialogDescription>
            Connect your business to delivery platforms and food donation networks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Platforms Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Delivery Platforms</h3>
              <Badge variant="secondary">
                {deliveryPlatforms.filter(p => p.connected).length} Connected
              </Badge>
            </div>

            <div className="grid gap-3">
              {deliveryPlatforms.map((platform) => {
                const PlatformIcon = platform.icon;
                const isConnecting = connectingId === platform.id;
                
                return (
                  <Card key={platform.id} className="relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1 shadow-sm">
                              <img 
                                src={platform.logoUrl} 
                                alt={`${platform.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.classList.add('bg-gradient-to-br', ...platform.color.split(' '));
                                    parent.innerHTML = `<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{platform.name}</h4>
                                {platform.connected && (
                                  <div className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3 text-green-500 animate-pulse" />
                                    <Badge variant="default" className="gap-1 bg-green-500">
                                      <Check className="h-3 w-3" />
                                      Connected
                                    </Badge>
                                  </div>
                                )}
                                {!platform.connected && (
                                  <div className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3 text-gray-400" />
                                    <Badge variant="outline" className="gap-1">
                                      Disconnected
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {platform.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!platform.connected ? (
                            <Button 
                              onClick={() => handleConnect(platform.id)}
                              disabled={isConnecting}
                              className="gap-2"
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Link2 className="h-4 w-4" />
                                  Connect
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://${platform.id}.com/dashboard`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDisconnect(platform.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Donation Platforms Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Food Donation Networks</h3>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {donationPlatforms.filter(p => p.connected).length} Connected
              </Badge>
            </div>

            <div className="grid gap-3">
              {donationPlatforms.map((platform) => {
                const PlatformIcon = platform.icon;
                const isConnecting = connectingId === platform.id;
                
                return (
                  <Card key={platform.id} className="border-red-200 relative overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-red-200 flex items-center justify-center p-1 shadow-sm">
                              <img 
                                src={platform.logoUrl} 
                                alt={`${platform.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to heart icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.classList.add('bg-gradient-to-br', ...platform.color.split(' '));
                                    parent.innerHTML = `<svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>`;
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{platform.name}</h4>
                                {platform.connected && (
                                  <div className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3 text-green-500 animate-pulse" />
                                    <Badge variant="default" className="gap-1 bg-green-500">
                                      <Check className="h-3 w-3" />
                                      Connected
                                    </Badge>
                                  </div>
                                )}
                                {!platform.connected && (
                                  <div className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3 text-gray-400" />
                                    <Badge variant="outline" className="gap-1">
                                      Disconnected
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {platform.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!platform.connected ? (
                            <Button 
                              onClick={() => handleConnect(platform.id)}
                              disabled={isConnecting}
                              className="gap-2 bg-red-500 hover:bg-red-600"
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Link2 className="h-4 w-4" />
                                  Connect
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`https://${platform.id}.org/portal`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDisconnect(platform.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success("Settings saved successfully");
              onOpenChange(false);
            }}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
