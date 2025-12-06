import { Card } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, DollarSign, ArrowUp, ArrowDown, Minus } from "lucide-react";

export interface KeyMetrics {
    demandChange: {
        value: number; // percentage
        trend: "up" | "down" | "stable";
    };
    wasteRisk: {
        level: "low" | "medium" | "high";
        score: number; // 0-100
    };
    potentialSavings: {
        amount: number; // in currency
        currency: string;
    };
}

interface KeyPredictionsProps {
    metrics: KeyMetrics;
    isLoading?: boolean;
}

export const KeyPredictions = ({ metrics, isLoading }: KeyPredictionsProps) => {
    const getRiskColor = (level: string) => {
        switch (level) {
            case "low":
                return "text-green-600 bg-green-50 border-green-200";
            case "medium":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "high":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up":
                return <ArrowUp className="h-4 w-4 text-green-600" />;
            case "down":
                return <ArrowDown className="h-4 w-4 text-red-600" />;
            default:
                return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                        <div className="h-24 bg-gray-100 animate-pulse rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">📊 Predicciones Clave</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Demand Change */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-gray-600">
                            Demanda Próxima Semana
                        </

                        p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">
                            {metrics.demandChange.value > 0 ? "+" : ""}
                            {metrics.demandChange.value}%
                        </p>
                        {getTrendIcon(metrics.demandChange.trend)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        vs. semana anterior
                    </p>
                </Card>

                {/* Waste Risk */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm font-medium text-gray-600">
                            Riesgo de Desperdicio
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className={`px-3 py-1 rounded-full border font-semibold capitalize ${getRiskColor(
                                metrics.wasteRisk.level
                            )}`}
                        >
                            {metrics.wasteRisk.level === "low" && "Bajo"}
                            {metrics.wasteRisk.level === "medium" && "Medio"}
                            {metrics.wasteRisk.level === "high" && "Alto"}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {metrics.wasteRisk.score}
                            <span className="text-sm text-gray-500 font-normal">/100</span>
                        </p>
                    </div>
                </Card>

                {/* Potential Savings */}
                <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-gray-600">
                            Ahorro Potencial
                        </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-green-600">
                            {metrics.potentialSavings.currency}
                            {metrics.potentialSavings.amount.toLocaleString()}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Productos recuperables
                    </p>
                </Card>
            </div>
        </div>
    );
};
