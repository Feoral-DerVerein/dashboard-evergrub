import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, DollarSign, Megaphone, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AutoPilotCardProps {
  data?: {
    activeModules?: string[];
    lastActions?: number;
    status?: 'active' | 'paused';
  };
}

export function AutoPilotCard({ data }: AutoPilotCardProps) {
  const navigate = useNavigate();

  const modules = [
    { name: 'Pricing Engine', icon: DollarSign, active: data?.activeModules?.includes('pricing') ?? true },
    { name: 'Promotions', icon: Megaphone, active: data?.activeModules?.includes('promotions') ?? true },
    { name: 'Production', icon: Package, active: data?.activeModules?.includes('production') ?? false },
    { name: 'Inventory', icon: ShoppingCart, active: data?.activeModules?.includes('inventory') ?? true },
  ];

  const status = data?.status || 'active';

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Auto-Pilot</CardTitle>
          </div>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? 'Active' : 'Paused'}
          </Badge>
        </div>
        <CardDescription>Real-time automation system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modules status */}
        <div className="space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div 
                key={module.name}
                className="flex items-center justify-between p-2 bg-muted/30 rounded"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{module.name}</span>
                </div>
                <Badge 
                  variant={module.active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {module.active ? 'ON' : 'OFF'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Quick stats */}
        <div className="p-3 bg-muted/50 rounded text-center">
          <p className="text-xs text-muted-foreground mb-1">Last 24 hours</p>
          <p className="text-2xl font-bold text-primary">{data?.lastActions || 127}</p>
          <p className="text-xs text-muted-foreground">automated actions</p>
        </div>

        <Button 
          onClick={() => navigate('/autopilot')}
          className="w-full"
          variant="default"
        >
          Configure Auto-Pilot
        </Button>
      </CardContent>
    </Card>
  );
}
