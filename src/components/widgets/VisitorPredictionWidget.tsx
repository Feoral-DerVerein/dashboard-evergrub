import { useState, useEffect } from "react";
import { Users, TrendingUp, Clock, AlertCircle, Loader2 } from "lucide-react";
import { HelpTooltip } from "@/components/dashboard/HelpTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { visitorPredictionService, VisitorPredictionData } from "@/services/visitorPredictionService";
import { useAuth } from "@/context/AuthContext";

const VisitorPredictionWidget = () => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<VisitorPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real prediction data
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await visitorPredictionService.getPrediction(user?.uid);
        setPrediction(data);
      } catch (err) {
        console.error('Error fetching visitor prediction:', err);
        setError('Error al cargar predicción');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingUp className="w-4 h-4 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="w-5 h-5" />
            Predicción de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="bg-white/80 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="w-5 h-5" />
            Predicción de Visitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error || 'Sin datos disponibles'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Users className="w-5 h-5" />
          Predicción de Visitantes
          <HelpTooltip kpiName="Predicción de Visitantes" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{prediction.expectedVisitors}</p>
              <p className="text-sm text-gray-600">Visitantes esperados hoy</p>
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
              {getTrendIcon(prediction.trend)}
              <span className="text-sm font-medium capitalize">
                {prediction.trend === 'up' ? 'Creciente' : prediction.trend === 'down' ? 'Decreciente' : 'Estable'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Pico: {prediction.peakHour}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Confianza: {prediction.confidence}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Factores Clave:</p>
            <div className="flex flex-wrap gap-1">
              {prediction.factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          {prediction.confidence > 0 && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-800">
                Recomendación IA: {prediction.expectedVisitors > 50 ? "Preparar personal adicional" : "Personal normal suficiente"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorPredictionWidget;