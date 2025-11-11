import { Button } from "@/components/ui/button";
import { 
  Heart, 
  ShoppingBag, 
  Percent, 
  Package, 
  FileText, 
  Store,
  Eye,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Action {
  label: string;
  type: "donate" | "create_bag" | "discount" | "inventory" | "report" | "marketplace" | "view_products";
  description: string;
}

interface ActionButtonsProps {
  actions: Action[];
}

export const ActionButtons = ({ actions }: ActionButtonsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const getActionIcon = (type: Action["type"]) => {
    switch (type) {
      case "donate":
        return <Heart className="w-4 h-4" />;
      case "create_bag":
        return <ShoppingBag className="w-4 h-4" />;
      case "discount":
        return <Percent className="w-4 h-4" />;
      case "inventory":
        return <Package className="w-4 h-4" />;
      case "report":
        return <FileText className="w-4 h-4" />;
      case "marketplace":
        return <Store className="w-4 h-4" />;
      case "view_products":
        return <Eye className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const handleAction = (action: Action) => {
    switch (action.type) {
      case "donate":
        navigate("/donate");
        toast({
          title: "Redirigiendo a donaciones",
          description: "Podrás seleccionar productos para donar.",
        });
        break;
      case "create_bag":
        navigate("/sales");
        toast({
          title: "Crear bolsa sorpresa",
          description: "Redirigiendo al creador de bolsas sorpresa.",
        });
        break;
      case "discount":
        navigate("/inventory-products");
        toast({
          title: "Aplicar descuentos",
          description: "Podrás seleccionar productos para aplicar descuentos.",
        });
        break;
      case "inventory":
        navigate("/inventory-products");
        break;
      case "report":
        navigate("/kpi");
        break;
      case "marketplace":
        navigate("/sales");
        break;
      case "view_products":
        navigate("/inventory-products");
        break;
      default:
        toast({
          title: action.label,
          description: action.description,
        });
    }
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-muted-foreground px-1">
        💡 Acciones sugeridas:
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={() => handleAction(action)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
            title={action.description}
          >
            {getActionIcon(action.type)}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
