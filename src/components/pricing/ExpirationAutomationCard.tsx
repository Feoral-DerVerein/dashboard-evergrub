import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pricingEngineService, PricingRule } from '@/services/pricingEngineService';
import { Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ExpirationAutomationCard = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<{ updated: number; products: string[] } | null>(null);

  const defaultRules = [
    { days: '7+', discount: 0, label: 'Productos con 7+ días', minDays: 7, maxDays: undefined },
    { days: '4-7', discount: 10, label: 'Productos con 4-7 días', minDays: 4, maxDays: 7 },
    { days: '2-3', discount: 25, label: 'Productos con 2-3 días', minDays: 2, maxDays: 3 },
    { days: '1 o menos', discount: 40, label: 'Productos con 1 día o menos', minDays: 0, maxDays: 1 },
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const allRules = await pricingEngineService.getPricingRules();
      const expirationRules = allRules.filter(r => r.rule_type === 'expiration');
      setRules(expirationRules);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await pricingEngineService.updatePricingRule(ruleId, { is_active: isActive });
      toast.success(isActive ? 'Regla activada' : 'Regla desactivada');
      loadRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Error al actualizar regla');
    }
  };

  const createRuleIfNotExists = async (ruleData: typeof defaultRules[0]) => {
    const existing = rules.find(
      r => r.discount_percentage === ruleData.discount
    );

    if (!existing) {
      await pricingEngineService.createPricingRule({
        rule_name: ruleData.label,
        rule_type: 'expiration',
        conditions: {
          minDays: ruleData.minDays,
          maxDays: ruleData.maxDays,
        },
        discount_percentage: ruleData.discount,
        is_active: true,
      });
    }
  };

  const initializeRules = async () => {
    try {
      for (const rule of defaultRules) {
        await createRuleIfNotExists(rule);
      }
      await loadRules();
      toast.success('Reglas inicializadas correctamente');
    } catch (error) {
      console.error('Error initializing rules:', error);
      toast.error('Error al inicializar reglas');
    }
  };

  const runAutomation = async () => {
    setIsRunning(true);
    try {
      const result = await pricingEngineService.checkExpirationPricing();
      setLastRun(result);

      if (result.updated > 0) {
        toast.success(`${result.updated} precios actualizados automáticamente`);
      } else {
        toast.info('No se encontraron productos que requieran ajuste de precio');
      }
    } catch (error) {
      console.error('Error running automation:', error);
      toast.error('Error al ejecutar automatización');
    } finally {
      setIsRunning(false);
    }
  };

  const getRuleByDiscount = (discount: number) => {
    return rules.find(r => r.discount_percentage === discount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatización por Riesgo de Expiración</CardTitle>
        <CardDescription>
          Ajuste automático de precios según días restantes hasta expiración
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rules List */}
        <div className="space-y-3">
          {defaultRules.map((ruleData) => {
            const rule = getRuleByDiscount(ruleData.discount);
            return (
              <div
                key={ruleData.days}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ruleData.label}</p>
                    {ruleData.discount > 0 && (
                      <Badge variant="secondary">-{ruleData.discount}%</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ruleData.discount === 0
                      ? 'Precio normal (100%)'
                      : `Descuento automático del ${ruleData.discount}%`}
                  </p>
                </div>
                <Switch
                  checked={rule?.is_active || false}
                  onCheckedChange={(checked) => {
                    if (rule) {
                      toggleRule(rule.id, checked);
                    }
                  }}
                  disabled={!rule}
                />
              </div>
            );
          })}
        </div>

        {rules.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
            <div>
              <p className="font-medium">No hay reglas configuradas</p>
              <p className="text-sm text-muted-foreground">
                Inicializa las reglas para comenzar a usar la automatización
              </p>
            </div>
            <Button onClick={initializeRules}>Inicializar Reglas</Button>
          </div>
        )}

        {rules.length > 0 && (
          <>
            {/* Run Automation Button */}
            <div className="space-y-3">
              <Button
                onClick={runAutomation}
                disabled={isRunning}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Ejecutando...' : 'Ejecutar Automatización Ahora'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                La automatización también se ejecuta automáticamente cada hora
              </p>
            </div>

            {/* Last Run Results */}
            {lastRun && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <p className="font-semibold text-sm">
                  Última Ejecución: {lastRun.updated} productos actualizados
                </p>
                {lastRun.products.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Productos modificados:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {lastRun.products.slice(0, 5).map((product, index) => (
                        <li key={index}>• {product}</li>
                      ))}
                      {lastRun.products.length > 5 && (
                        <li>... y {lastRun.products.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpirationAutomationCard;
