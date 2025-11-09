import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  ShoppingCart, 
  Truck, 
  Package2,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  logoUrl?: string;
  connected: boolean;
  category: "pos" | "erp" | "delivery";
}

const integrations: Integration[] = [
  // POS Systems
  {
    id: "square",
    name: "Square",
    type: "POS System",
    description: "Point of sale and payment processing",
    icon: <CreditCard className="w-8 h-8" />,
    logoUrl: "/lovable-uploads/560fe3d2-8e81-48aa-8f97-9da38ca157e2.png",
    connected: false,
    category: "pos"
  },
  {
    id: "clover",
    name: "Clover",
    type: "POS System",
    description: "Complete point of sale solution",
    icon: <CreditCard className="w-8 h-8" />,
    connected: false,
    category: "pos"
  },
  {
    id: "toast",
    name: "Toast",
    type: "POS System",
    description: "Restaurant POS and management",
    icon: <CreditCard className="w-8 h-8" />,
    connected: false,
    category: "pos"
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    type: "POS System",
    description: "Retail and restaurant POS",
    icon: <CreditCard className="w-8 h-8" />,
    connected: false,
    category: "pos"
  },
  
  // ERP Systems
  {
    id: "sap",
    name: "SAP",
    type: "ERP System",
    description: "Enterprise resource planning",
    icon: <Package2 className="w-8 h-8" />,
    connected: false,
    category: "erp"
  },
  {
    id: "oracle",
    name: "Oracle ERP",
    type: "ERP System",
    description: "Cloud-based enterprise management",
    icon: <Package2 className="w-8 h-8" />,
    connected: false,
    category: "erp"
  },
  {
    id: "microsoft-dynamics",
    name: "Microsoft Dynamics",
    type: "ERP System",
    description: "Business applications platform",
    icon: <Package2 className="w-8 h-8" />,
    connected: false,
    category: "erp"
  },
  
  // Delivery Platforms
  {
    id: "uber-eats",
    name: "Uber Eats",
    type: "Delivery Platform",
    description: "Food delivery service",
    icon: <Truck className="w-8 h-8" />,
    connected: false,
    category: "delivery"
  },
  {
    id: "rappi",
    name: "Rappi",
    type: "Delivery Platform",
    description: "Multi-category delivery platform",
    icon: <Truck className="w-8 h-8" />,
    connected: false,
    category: "delivery"
  },
  {
    id: "doordash",
    name: "DoorDash",
    type: "Delivery Platform",
    description: "Food delivery and logistics",
    icon: <Truck className="w-8 h-8" />,
    connected: false,
    category: "delivery"
  },
  {
    id: "glovo",
    name: "Glovo",
    type: "Delivery Platform",
    description: "On-demand delivery service",
    icon: <Truck className="w-8 h-8" />,
    connected: false,
    category: "delivery"
  },
  {
    id: "deliverect",
    name: "Deliverect",
    type: "Delivery Platform",
    description: "Integration hub for delivery platforms",
    icon: <Truck className="w-8 h-8" />,
    connected: false,
    category: "delivery"
  }
];

const Integrations = () => {
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "pos":
        return "Point of Sale Systems";
      case "erp":
        return "ERP Systems";
      case "delivery":
        return "Delivery Platforms";
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pos":
        return <CreditCard className="w-5 h-5" />;
      case "erp":
        return <Package2 className="w-5 h-5" />;
      case "delivery":
        return <Truck className="w-5 h-5" />;
      default:
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const categories = ["pos", "erp", "delivery"] as const;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Negentropy with your existing tools and platforms
        </p>
      </div>

      {categories.map((category) => {
        const categoryIntegrations = integrations.filter(
          (integration) => integration.category === category
        );

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              {getCategoryIcon(category)}
              <h2 className="text-2xl font-semibold text-foreground">
                {getCategoryTitle(category)}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {integration.logoUrl ? (
                          <img
                            src={integration.logoUrl}
                            alt={integration.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="text-primary">{integration.icon}</div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {integration.type}
                          </Badge>
                        </div>
                      </div>
                      {integration.connected && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {integration.description}
                    </CardDescription>
                    <div className="flex gap-2">
                      {integration.connected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            Configure
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1">
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Integrations;
