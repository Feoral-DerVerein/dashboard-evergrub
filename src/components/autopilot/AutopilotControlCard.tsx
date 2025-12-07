import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { autopilotService, AutopilotSettings } from '@/services/autopilotService';
import { Bot, DollarSign, Megaphone, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const moduleIcons = {
  pricing: DollarSign,
  promotions: Megaphone,
  production: Package,
  inventory: ShoppingCart,
};

const AutopilotControlCard = () => {
  const { t } = useTranslation();
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

  const getModuleLabel = (moduleName: string) => {
    return t(`autopilot_control.modules.${moduleName}`, moduleName); // Fallback to key if not found
  };

  const handleToggleModule = async (moduleName: string, isActive: boolean) => {
    try {
      await autopilotService.updateSettings(moduleName, { is_active: isActive });
      const message = isActive
        ? t('autopilot_control.status.enabled', { module: getModuleLabel(moduleName) })
        : t('autopilot_control.status.disabled', { module: getModuleLabel(moduleName) });
      toast.success(message);
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

  // Keys derived from moduleIcons keys which match translation keys
  const moduleKeys = Object.keys(moduleIcons);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{t('autopilot_control.title')}</CardTitle>
            <CardDescription>
              {t('autopilot_control.description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {moduleKeys.map((key) => {
          const Icon = moduleIcons[key as keyof typeof moduleIcons];
          const setting = getModuleSetting(key);
          const label = t(`autopilot_control.modules.${key}`);

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
                        {t('autopilot_control.status.active')}
                      </Badge>
                    )}
                  </div>
                  {setting?.last_execution && (
                    <p className="text-xs text-muted-foreground">
                      {t('autopilot_control.status.last_execution', {
                        date: new Date(setting.last_execution).toLocaleString()
                      })}
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
                    <SelectItem value="realtime">{t('autopilot_control.frequency.realtime')}</SelectItem>
                    <SelectItem value="hourly">{t('autopilot_control.frequency.hourly')}</SelectItem>
                    <SelectItem value="daily">{t('autopilot_control.frequency.daily')}</SelectItem>
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
