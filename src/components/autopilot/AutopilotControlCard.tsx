import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { autopilotService, AutopilotSettings } from '@/services/autopilotService';
import { Bot, DollarSign, Megaphone, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const moduleIcons = {
  pricing: DollarSign,
  promotions: Megaphone,
  production: Package,
  inventory: ShoppingCart,
};

const moduleLabels = {
  pricing: 'Pricing Engine',
  promotions: 'Automatic Promotions',
  production: 'Production Recommendations',
  inventory: 'Smart Reordering',
};

const AutopilotControlCard = () => {
  const [settings, setSettings] = useState<AutopilotSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await autopilotService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = async (moduleName: string, isActive: boolean) => {
    try {
      await autopilotService.updateSettings(moduleName, { is_active: isActive });
      toast.success(isActive ? `${moduleLabels[moduleName as keyof typeof moduleLabels]} enabled` : `${moduleLabels[moduleName as keyof typeof moduleLabels]} disabled`);
      loadSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error updating configuration');
    }
  };

  const handleFrequencyChange = async (moduleName: string, frequency: string) => {
    try {
      await autopilotService.updateSettings(moduleName, { execution_frequency: frequency as any });
      toast.success('Frequency updated');
      loadSettings();
    } catch (error) {
      console.error('Error updating frequency:', error);
      toast.error('Error updating frequency');
    }
  };

  const getModuleSetting = (moduleName: string) => {
    return settings.find(s => s.module_name === moduleName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Auto-Pilot Control</CardTitle>
            <CardDescription>
              Configure real-time automation modules
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(moduleLabels).map(([key, label]) => {
          const Icon = moduleIcons[key as keyof typeof moduleIcons];
          const setting = getModuleSetting(key);

          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{label}</p>
                    {setting?.is_active && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  {setting?.last_execution && (
                    <p className="text-xs text-muted-foreground">
                      Last execution:{' '}
                      {new Date(setting.last_execution).toLocaleString('en-US')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select
                  value={setting?.execution_frequency || 'hourly'}
                  onValueChange={(value) => handleFrequencyChange(key, value)}
                  disabled={!setting?.is_active}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>

                <Switch
                  checked={setting?.is_active || false}
                  onCheckedChange={(checked) => handleToggleModule(key, checked)}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AutopilotControlCard;
