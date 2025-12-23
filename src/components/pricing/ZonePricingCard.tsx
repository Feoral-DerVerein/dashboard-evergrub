import { useState, useEffect } from 'react';
import { HelpTooltip } from '@/components/dashboard/HelpTooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pricingEngineService, ZoneMultiplier } from '@/services/pricingEngineService';
import { MapPin, Edit, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const ZonePricingCard = () => {
  const [zones, setZones] = useState<ZoneMultiplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneMultiplier | null>(null);
  const [formData, setFormData] = useState({
    zone_name: '',
    zone_code: '',
    price_multiplier: '1.0',
    demand_level: 'medium' as 'high' | 'medium' | 'low',
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const data = await pricingEngineService.getZoneMultipliers();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
      toast.error('Error al cargar zonas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveZone = async () => {
    try {
      const multiplier = parseFloat(formData.price_multiplier);
      if (isNaN(multiplier) || multiplier <= 0) {
        toast.error('Multiplicador inválido');
        return;
      }

      if (editingZone) {
        await pricingEngineService.updateZoneMultiplier(editingZone.id, {
          zone_name: formData.zone_name,
          price_multiplier: multiplier,
          demand_level: formData.demand_level,
        });

        // Apply zone pricing
        const result = await pricingEngineService.applyZonePricing(
          editingZone.zone_code,
          multiplier
        );

        toast.success(
          `Zona actualizada. ${result.updated} productos ajustados.`
        );
      } else {
        await pricingEngineService.createZoneMultiplier({
          zone_name: formData.zone_name,
          zone_code: formData.zone_code,
          price_multiplier: multiplier,
          demand_level: formData.demand_level,
        });

        toast.success('Zona creada correctamente');
      }

      setIsDialogOpen(false);
      loadZones();
      resetForm();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Error al guardar zona');
    }
  };

  const resetForm = () => {
    setFormData({
      zone_name: '',
      zone_code: '',
      price_multiplier: '1.0',
      demand_level: 'medium',
    });
    setEditingZone(null);
  };

  const openEditDialog = (zone: ZoneMultiplier) => {
    setEditingZone(zone);
    setFormData({
      zone_name: zone.zone_name,
      zone_code: zone.zone_code,
      price_multiplier: zone.price_multiplier.toString(),
      demand_level: zone.demand_level,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">Alta Demanda</Badge>;
      case 'medium':
        return <Badge variant="default">Demanda Media</Badge>;
      case 'low':
        return <Badge variant="secondary">Baja Demanda</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Precios por Zona Geográfica
              <HelpTooltip kpiName="Precios por Zona" />
            </CardTitle>
            <CardDescription>
              Ajusta precios según ubicación y demanda local
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Zona
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingZone ? 'Editar Zona' : 'Nueva Zona'}
                </DialogTitle>
                <DialogDescription>
                  Configura los precios según la zona geográfica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Nombre de Zona</label>
                  <Input
                    value={formData.zone_name}
                    onChange={(e) =>
                      setFormData({ ...formData, zone_name: e.target.value })
                    }
                    placeholder="ej: Centro Histórico"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Código de Zona</label>
                  <Input
                    value={formData.zone_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zone_code: e.target.value })
                    }
                    placeholder="ej: CENTRO"
                    className="mt-1"
                    disabled={!!editingZone}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Multiplicador de Precio
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_multiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_multiplier: e.target.value,
                      })
                    }
                    placeholder="1.0"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1.15 = +15% | 0.90 = -10%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nivel de Demanda</label>
                  <Select
                    value={formData.demand_level}
                    onValueChange={(value: 'high' | 'medium' | 'low') =>
                      setFormData({ ...formData, demand_level: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta Demanda</SelectItem>
                      <SelectItem value="medium">Demanda Media</SelectItem>
                      <SelectItem value="low">Baja Demanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveZone} className="w-full">
                  {editingZone ? 'Actualizar Zona' : 'Crear Zona'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {zones.map((zone) => {
            const priceChange = ((zone.price_multiplier - 1) * 100).toFixed(0);
            const isIncrease = zone.price_multiplier > 1;

            return (
              <div
                key={zone.id}
                className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{zone.zone_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Código: {zone.zone_code}
                    </p>
                  </div>
                  {getDemandBadge(zone.demand_level)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {zone.price_multiplier}x
                  </span>
                  {priceChange !== '0' && (
                    <Badge
                      variant={isIncrease ? 'destructive' : 'default'}
                      className="gap-1"
                    >
                      {isIncrease ? '+' : ''}
                      {priceChange}%
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(zone)}
                    className="w-full gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar Multiplicador
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {zones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay zonas configuradas</p>
            <p className="text-xs">Crea una zona para comenzar</p>
          </div>
        )}

        {zones.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ejemplo Práctico
            </p>
            <p className="text-xs text-muted-foreground">
              Si un café tiene precio base de $40 MXN:
              {zones.slice(0, 2).map((zone) => {
                const finalPrice = (40 * zone.price_multiplier).toFixed(2);
                return (
                  <span key={zone.id} className="block mt-1">
                    • En {zone.zone_name}: ${finalPrice} MXN (base $40 x{' '}
                    {zone.price_multiplier})
                  </span>
                );
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ZonePricingCard;
