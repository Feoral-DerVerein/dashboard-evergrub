import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  Tag,
  Plus,
  Percent,
  Info,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductCardData } from '@/types/chatbot.types';

interface ProductCardsProps {
  products: ProductCardData[];
  onAddToTaskList?: (card: any, title: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
}

export const ProductCards = ({ products, onAddToTaskList }: ProductCardsProps) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBorderColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'border-l-destructive';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-muted';
    }
  };

  const handleAddToTask = (product: ProductCardData) => {
    if (onAddToTaskList) {
      const taskTitle = `Revisar ${product.name} - vence en ${product.days_until_expiry} días`;
      const taskDescription = `Producto con descuento sugerido del ${product.suggested_discount}%`;
      const priority = product.urgency_level;
      
      onAddToTaskList(
        { id: product.id, type: 'product', data: product },
        taskTitle,
        taskDescription,
        priority
      );
      toast.success('Tarea agregada a la lista');
    }
  };

  const handleApplyDiscount = (product: ProductCardData) => {
    toast.success(`Descuento del ${product.suggested_discount}% aplicado a ${product.name}`);
  };

  const handleViewDetails = (product: ProductCardData) => {
    toast.info(`Mostrando detalles de ${product.name}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {products.map((product, index) => (
        <Card 
          key={product.id}
          className={`border-l-4 ${getBorderColor(product.urgency_level)} hover:shadow-xl hover:scale-102 transition-all duration-300 animate-fade-in cursor-pointer`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                {product.name}
              </CardTitle>
              <Badge className={`${getUrgencyColor(product.urgency_level)} text-xs animate-pulse`}>
                {product.urgency_level === 'critical' ? 'CRÍTICO' : 
                 product.urgency_level === 'high' ? 'ALTO' : 
                 product.urgency_level === 'medium' ? 'MEDIO' : 'BAJO'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Product Image Placeholder */}
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg bg-muted"
                />
              ) : (
                <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              {/* Product Info */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Tag className="w-3 h-3" />
                  <span>{product.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-muted-foreground line-through">${product.original_price}</span>
                  <span className="text-primary font-bold">
                    ${(product.original_price * (1 - product.suggested_discount / 100)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expiry Info */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm">
                  Vence en <span className="font-bold">{product.days_until_expiry}</span> día{product.days_until_expiry !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Discount Badge */}
              <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <Percent className="w-4 h-4 text-primary mr-1" />
                <span className="text-primary font-bold">
                  {product.suggested_discount}% descuento sugerido
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs hover:bg-primary/10"
                  onClick={() => handleAddToTask(product)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar a Tareas
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="text-xs"
                    onClick={() => handleApplyDiscount(product)}
                  >
                    <Percent className="w-3 h-3 mr-1" />
                    Aplicar Descuento
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => handleViewDetails(product)}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Ver Detalles
                  </Button>
                </div>
              </div>

              {/* Quantity if available */}
              {product.quantity && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  {product.quantity} unidades disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};