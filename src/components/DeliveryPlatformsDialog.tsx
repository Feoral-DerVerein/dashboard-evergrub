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
import { Switch } from "@/components/ui/switch";
import { 
  Truck, 
  Heart, 
  ExternalLink,
  Check,
  X
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
  logo?: string;
  connected: boolean;
  description: string;
}

export function DeliveryPlatformsDialog({ open, onOpenChange }: DeliveryPlatformsDialogProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "ubereats",
      name: "Uber Eats",
      type: "delivery",
      connected: false,
      description: "Connect to send products directly to Uber Eats"
    },
    {
      id: "doordash",
      name: "DoorDash",
      type: "delivery",
      connected: false,
      description: "Integrate with DoorDash for food delivery"
    },
    {
      id: "grubhub",
      name: "GrubHub",
      type: "delivery",
      connected: false,
      description: "Sell surplus food through GrubHub platform"
    },
    {
      id: "postmates",
      name: "Postmates",
      type: "delivery",
      connected: false,
      description: "Send products via Postmates delivery"
    },
    {
      id: "deliveroo",
      name: "Deliveroo",
      type: "delivery",
      connected: false,
      description: "Connect to Deliveroo marketplace"
    },
    {
      id: "foodpanda",
      name: "Foodpanda",
      type: "delivery",
      connected: false,
      description: "Expand reach with Foodpanda delivery"
    },
    {
      id: "feeding-america",
      name: "Feeding America",
      type: "donation",
      connected: false,
      description: "Donate surplus food to those in need"
    },
    {
      id: "foodbank-nyc",
      name: "Food Bank NYC",
      type: "donation",
      connected: false,
      description: "Support New York City food bank network"
    },
    {
      id: "second-harvest",
      name: "Second Harvest",
      type: "donation",
      connected: false,
      description: "Contribute to Second Harvest food rescue"
    },
    {
      id: "local-foodbank",
      name: "Local Food Banks",
      type: "donation",
      connected: false,
      description: "Connect with local community food banks"
    },
    {
      id: "food-rescue",
      name: "Food Rescue US",
      type: "donation",
      connected: false,
      description: "Partner with Food Rescue organizations"
    },
  ]);

  const handleToggleConnection = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: !p.connected }
          : p
      )
    );
    
    const platform = platforms.find(p => p.id === platformId);
    if (platform) {
      toast.success(
        platform.connected 
          ? `Disconnected from ${platform.name}` 
          : `Connected to ${platform.name}`
      );
    }
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
              {deliveryPlatforms.map((platform) => (
                <Card key={platform.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {platform.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{platform.name}</h4>
                              {platform.connected && (
                                <Badge variant="default" className="gap-1">
                                  <Check className="h-3 w-3" />
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={platform.connected}
                          onCheckedChange={() => handleToggleConnection(platform.id)}
                        />
                        {platform.connected && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              {donationPlatforms.map((platform) => (
                <Card key={platform.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
                            <Heart className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{platform.name}</h4>
                              {platform.connected && (
                                <Badge variant="default" className="gap-1 bg-red-500">
                                  <Check className="h-3 w-3" />
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={platform.connected}
                          onCheckedChange={() => handleToggleConnection(platform.id)}
                        />
                        {platform.connected && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
