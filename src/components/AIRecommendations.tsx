import { ShoppingCart, TrendingUp, Heart, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIRecommendation {
  id: string;
  type: 'purchase' | 'demand' | 'donation' | 'optimization';
  title: string;
  description: string;
  icon: any;
  borderColor: string;
  iconColor: string;
}

const recommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Reducir compra de tomates',
    description: 'Reduce compra un 15% la próxima semana por baja demanda histórica',
    icon: ShoppingCart,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500'
  },
  {
    id: '2',
    type: 'demand',
    title: 'Incrementar pan integral',
    description: 'Aumentar compra 10% por alta demanda prevista esta semana',
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  },
  {
    id: '3',
    type: 'donation',
    title: 'Donar yogures',
    description: 'Productos vencen en 2 días, sugiere donación a banco de alimentos',
    icon: Heart,
    borderColor: 'border-l-orange-500',
    iconColor: 'text-orange-500'
  },
  {
    id: '4',
    type: 'optimization',
    title: 'Redistribuir lácteos',
    description: 'Mover excedentes de leche a sucursal centro para evitar pérdidas',
    icon: RefreshCw,
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500'
  },
  {
    id: '5',
    type: 'demand',
    title: 'Demanda de café',
    description: 'Demanda aumentará 12% por temporada de exámenes universitarios',
    icon: TrendingUp,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500'
  }
];

const RecommendationCard = ({ recommendation }: { recommendation: AIRecommendation }) => {
  const Icon = recommendation.icon;
  
  return (
    <Card className={`border-l-4 ${recommendation.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className={`w-4 h-4 ${recommendation.iconColor}`} />
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {recommendation.description}
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-7 text-xs">
            <Check className="w-3 h-3 mr-1" />
            Aplicar
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const AIRecommendations = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recomendaciones IA</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Actualizadas hoy
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <RecommendationCard 
            key={recommendation.id} 
            recommendation={recommendation} 
          />
        ))}
      </div>
    </div>
  );
};