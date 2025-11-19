import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionCardData } from '@/types/chatbot.types';
import { useToast } from '@/hooks/use-toast';

interface ActionCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ActionCardData;
}

export const ActionCardDialog = ({ open, onOpenChange, data }: ActionCardDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    address: '',
    contact: '',
    date: '',
    percentage: '',
    duration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Acción completada",
      description: `${data.action} para ${data.productName} procesado exitosamente.`,
    });
    
    onOpenChange(false);
    setFormData({
      address: '',
      contact: '',
      date: '',
      percentage: '',
      duration: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.action}</DialogTitle>
          <DialogDescription>
            Completa los detalles para {data.productName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {data.type === 'donation' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección de entrega</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle 123, Ciudad"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contacto</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Nombre y teléfono"
                    required
                  />
                </div>
              </>
            )}

            {data.type === 'delivery' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="delivery-address">Dirección de envío</Label>
                  <Input
                    id="delivery-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle 123, Ciudad"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha de entrega</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {data.type === 'discount' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Porcentaje de descuento</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duración (días)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="7"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
