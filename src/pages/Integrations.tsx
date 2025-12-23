import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ShoppingCart,
  Truck,
  Package2,
  CheckCircle2,
  ExternalLink,
  Heart
} from "lucide-react";
import { ProductImportCard } from "@/components/ProductImportCard";
import { IntegrationDialog } from "@/components/integrations/IntegrationDialog";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  logoUrl?: string;
  connected: boolean;
  lastSync?: string;
  category: "pos" | "erp" | "delivery" | "foodbank";
}

const integrations: Integration[] = [
  // POS Systems
  {
    id: "square",
    name: "Square",
    type: "POS System",
    description: "Point of sale and payment processing",
    icon: <CreditCard className="w-8 h-8" />,
    logoUrl: "/integration-logos/square-logo.png",
    connected: false,
    category: "pos"
  },
  {
    id: "clover",
    name: "Clover",
    type: "POS System",
    description: "Complete point of sale solution",
    icon: <CreditCard className="w-8 h-8" />,
    logoUrl: "/integration-logos/clover-logo.svg",
    connected: false,
    category: "pos"
  },
  {
    id: "toast",
    name: "Toast",
    type: "POS System",
    description: "Restaurant POS and management",
    icon: <CreditCard className="w-8 h-8" />,
    logoUrl: "/integration-logos/toast-logo.png",
    connected: false,
    category: "pos"
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    type: "POS System",
    description: "Retail and restaurant POS",
    icon: <CreditCard className="w-8 h-8" />,
    logoUrl: "/integration-logos/lightspeed-logo.png",
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
    logoUrl: "/integration-logos/sap-logo.png",
    connected: false,
    category: "erp"
  },
  {
    id: "oracle",
    name: "Oracle ERP",
    type: "ERP System",
    description: "Cloud-based enterprise management",
    icon: <Package2 className="w-8 h-8" />,
    logoUrl: "/integration-logos/oracle-logo.png",
    connected: false,
    category: "erp"
  },
  {
    id: "microsoft-dynamics",
    name: "Microsoft Dynamics",
    type: "ERP System",
    description: "Business applications platform",
    icon: <Package2 className="w-8 h-8" />,
    logoUrl: "/integration-logos/microsoft-dynamics-logo.png",
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
    logoUrl: "/integration-logos/uber-eats-logo.png",
    connected: false,
    category: "delivery"
  },
  {
    id: "rappi",
    name: "Rappi",
    type: "Delivery Platform",
    description: "Multi-category delivery platform",
    icon: <Truck className="w-8 h-8" />,
    logoUrl: "/integration-logos/rappi-logo.png",
    connected: false,
    category: "delivery"
  },
  {
    id: "doordash",
    name: "DoorDash",
    type: "Delivery Platform",
    description: "Food delivery and logistics",
    icon: <Truck className="w-8 h-8" />,
    logoUrl: "/integration-logos/doordash-logo.png",
    connected: false,
    category: "delivery"
  },
  {
    id: "glovo",
    name: "Glovo",
    type: "Delivery Platform",
    description: "On-demand delivery service",
    icon: <Truck className="w-8 h-8" />,
    logoUrl: "/integration-logos/glovo-logo.png",
    connected: false,
    category: "delivery"
  },
  {
    id: "toogoodtogo",
    name: "Too Good To Go",
    type: "Delivery Platform",
    description: "Surplus food redistribution platform",
    icon: <Truck className="w-8 h-8" />,
    logoUrl: "/integration-logos/toogoodtogo-logo.png",
    connected: false,
    category: "delivery"
  },
  {
    id: "deliverect",
    name: "Deliverect",
    type: "Delivery Platform",
    description: "Integration hub for delivery platforms",
    icon: <Truck className="w-8 h-8" />,
    logoUrl: "/integration-logos/deliverect-logo.png",
    connected: false,
    category: "delivery"
  },

  // Food Banks
  {
    id: "banc-aliments-barcelona",
    name: "Banc dels Aliments",
    type: "Food Bank",
    description: "Banco de alimentos de Barcelona",
    icon: <Heart className="w-8 h-8" />,
    logoUrl: "/integration-logos/banc-aliments-barcelona-logo.png",
    connected: false,
    category: "foodbank"
  },
  {
    id: "fesbal",
    name: "FESBAL",
    type: "Food Bank",
    description: "Federación Española de Bancos de Alimentos",
    icon: <Heart className="w-8 h-8" />,
    logoUrl: "/integration-logos/fesbal-logo.png",
    connected: false,
    category: "foodbank"
  },
  {
    id: "cruz-roja",
    name: "Cruz Roja España",
    type: "Food Bank",
    description: "Organización humanitaria y banco de alimentos",
    icon: <Heart className="w-8 h-8" />,
    logoUrl: "/integration-logos/cruz-roja-logo.png",
    connected: false,
    category: "foodbank"
  },
  {
    id: "caritas",
    name: "Cáritas España",
    type: "Food Bank",
    description: "Organización benéfica y distribución de alimentos",
    icon: <Heart className="w-8 h-8" />,
    logoUrl: "/integration-logos/caritas-logo.png",
    connected: false,
    category: "foodbank"
  }
];

const Integrations = () => {
  const { user } = useAuth();
  const [activeIntegrationId, setActiveIntegrationId] = useState<string | null>(null);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({});

  // Listen for integration status in Firestore
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'integrations', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const status: Record<string, { connected: boolean; lastSync?: string }> = {};
        Object.keys(data).forEach(key => {
          status[key] = {
            connected: !!data[key]?.connected,
            lastSync: data[key]?.lastSync
          };
        });
        setConnectedApps(status as any);
      }
    });

    return () => unsub();
  }, [user]);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "pos":
        return "Point of Sale Systems";
      case "erp":
        return "ERP Systems";
      case "delivery":
        return "Delivery Platforms";
      case "foodbank":
        return "Bancos de Alimentos";
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
      case "foodbank":
        return <Heart className="w-5 h-5" />;
      default:
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const categories = ["pos", "erp", "delivery", "foodbank"] as const;

  // Initial integrations list with initial connection status
  const baseIntegrations: Integration[] = [
    // POS Systems
    {
      id: "square",
      name: "Square",
      type: "POS System",
      description: "Point of sale and payment processing",
      icon: <CreditCard className="w-8 h-8" />,
      logoUrl: "/integration-logos/square-logo.png",
      connected: !!(connectedApps as any).square?.connected,
      lastSync: (connectedApps as any).square?.lastSync,
      category: "pos"
    },
    {
      id: "clover",
      name: "Clover",
      type: "POS System",
      description: "Complete point of sale solution",
      icon: <CreditCard className="w-8 h-8" />,
      logoUrl: "/integration-logos/clover-logo.svg",
      connected: !!connectedApps.clover,
      category: "pos"
    },
    {
      id: "toast",
      name: "Toast",
      type: "POS System",
      description: "Restaurant POS and management",
      icon: <CreditCard className="w-8 h-8" />,
      logoUrl: "/integration-logos/toast-logo.png",
      connected: !!connectedApps.toast,
      category: "pos"
    },
    {
      id: "lightspeed",
      name: "Lightspeed",
      type: "POS System",
      description: "Retail and restaurant POS",
      icon: <CreditCard className="w-8 h-8" />,
      logoUrl: "/integration-logos/lightspeed-logo.png",
      connected: !!connectedApps.lightspeed,
      category: "pos"
    },
    {
      id: "shopify",
      name: "Shopify",
      type: "POS/Ecommerce",
      description: "Cloud-based retail and online sales",
      icon: <ShoppingCart className="w-8 h-8" />,
      logoUrl: "/integration-logos/shopify-logo.png",
      connected: !!connectedApps.shopify,
      category: "pos"
    },

    // ERP Systems
    {
      id: "sap",
      name: "SAP",
      type: "ERP System",
      description: "Enterprise resource planning",
      icon: <Package2 className="w-8 h-8" />,
      logoUrl: "/integration-logos/sap-logo.png",
      connected: !!connectedApps.sap,
      category: "erp"
    },
    {
      id: "oracle",
      name: "Oracle ERP",
      type: "ERP System",
      description: "Cloud-based enterprise management",
      icon: <Package2 className="w-8 h-8" />,
      logoUrl: "/integration-logos/oracle-logo.png",
      connected: !!connectedApps.oracle,
      category: "erp"
    },
    {
      id: "microsoft-dynamics",
      name: "Microsoft Dynamics",
      type: "ERP System",
      description: "Business applications platform",
      icon: <Package2 className="w-8 h-8" />,
      logoUrl: "/integration-logos/microsoft-dynamics-logo.png",
      connected: !!connectedApps['microsoft-dynamics'],
      category: "erp"
    },

    // Delivery Platforms
    {
      id: "uber-eats",
      name: "Uber Eats",
      type: "Delivery Platform",
      description: "Food delivery service",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/uber-eats-logo.png",
      connected: !!connectedApps['uber-eats'],
      category: "delivery"
    },
    {
      id: "rappi",
      name: "Rappi",
      type: "Delivery Platform",
      description: "Multi-category delivery platform",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/rappi-logo.png",
      connected: !!connectedApps.rappi,
      category: "delivery"
    },
    {
      id: "doordash",
      name: "DoorDash",
      type: "Delivery Platform",
      description: "Food delivery and logistics",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/doordash-logo.png",
      connected: !!connectedApps.doordash,
      category: "delivery"
    },
    {
      id: "glovo",
      name: "Glovo",
      type: "Delivery Platform",
      description: "On-demand delivery service",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/glovo-logo.png",
      connected: !!connectedApps.glovo,
      category: "delivery"
    },
    {
      id: "toogoodtogo",
      name: "Too Good To Go",
      type: "Delivery Platform",
      description: "Surplus food redistribution platform",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/toogoodtogo-logo.png",
      connected: !!connectedApps.toogoodtogo,
      category: "delivery"
    },
    {
      id: "deliverect",
      name: "Deliverect",
      type: "Delivery Platform",
      description: "Integration hub for delivery platforms",
      icon: <Truck className="w-8 h-8" />,
      logoUrl: "/integration-logos/deliverect-logo.png",
      connected: !!connectedApps.deliverect,
      category: "delivery"
    },

    // Food Banks
    {
      id: "banc-aliments-barcelona",
      name: "Banc dels Aliments",
      type: "Food Bank",
      description: "Banco de alimentos de Barcelona",
      icon: <Heart className="w-8 h-8" />,
      logoUrl: "/integration-logos/banc-aliments-barcelona-logo.png",
      connected: !!connectedApps['banc-aliments-barcelona'],
      category: "foodbank"
    },
    {
      id: "fesbal",
      name: "FESBAL",
      type: "Food Bank",
      description: "Federación Española de Bancos de Alimentos",
      icon: <Heart className="w-8 h-8" />,
      logoUrl: "/integration-logos/fesbal-logo.png",
      connected: !!connectedApps.fesbal,
      category: "foodbank"
    },
    {
      id: "cruz-roja",
      name: "Cruz Roja España",
      type: "Food Bank",
      description: "Organización humanitaria y banco de alimentos",
      icon: <Heart className="w-8 h-8" />,
      logoUrl: "/integration-logos/cruz-roja-logo.png",
      connected: !!connectedApps['cruz-roja'],
      category: "foodbank"
    },
    {
      id: "caritas",
      name: "Cáritas España",
      type: "Food Bank",
      description: "Organización benéfica y distribución de alimentos",
      icon: <Heart className="w-8 h-8" />,
      logoUrl: "/integration-logos/caritas-logo.png",
      connected: !!connectedApps.caritas,
      category: "foodbank"
    }
  ];

  const handleConnect = (id: string) => {
    setActiveIntegrationId(id);
    setIntegrationDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Negentropy with your existing tools and platforms
        </p>
      </div>

      {/* Product Import Section */}
      <div className="mb-6">
        <ProductImportCard />
      </div>

      {categories.map((category) => {
        const categoryIntegrations = baseIntegrations.filter(
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
                    <CardDescription className="mb-2">
                      {integration.description}
                    </CardDescription>
                    {integration.connected && integration.lastSync && (
                      <div className="text-[10px] text-muted-foreground mb-4 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Last synced: {new Date(integration.lastSync).toLocaleString()}
                      </div>
                    )}
                    {!integration.lastSync && integration.connected && (
                      <div className="text-[10px] text-muted-foreground mb-4">
                        Waiting for first sync...
                      </div>
                    )}
                    <div className="flex gap-2">
                      {integration.connected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConnect(integration.id)}>
                            Configure
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1" onClick={() => handleConnect(integration.id)}>
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

      {activeIntegrationId && (
        <IntegrationDialog
          id={activeIntegrationId}
          open={integrationDialogOpen}
          onOpenChange={setIntegrationDialogOpen}
          onSuccess={() => setIntegrationDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default Integrations;
