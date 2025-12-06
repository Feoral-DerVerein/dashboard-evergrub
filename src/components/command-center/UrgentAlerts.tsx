import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface Alert {
    id: string;
    type: "critical" | "warning" | "success";
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
}

interface UrgentAlertsProps {
    alerts: Alert[];
    isLoading?: boolean;
}

export const UrgentAlerts = ({ alerts, isLoading }: UrgentAlertsProps) => {
    const navigate = useNavigate();

    const getAlertIcon = (type: Alert["type"]) => {
        switch (type) {
            case "critical":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
    };

    const getAlertBorderColor = (type: Alert["type"]) => {
        switch (type) {
            case "critical":
                return "border-l-4 border-l-red-500";
            case "warning":
                return "border-l-4 border-l-yellow-500";
            case "success":
                return "border-l-4 border-l-green-500";
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">🚨 Acciones Urgentes</h2>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
                    ))}
                </div>
            </Card>
        );
    }

    if (alerts.length === 0) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">🚨 Acciones Urgentes</h2>
                </div>
                <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600">Todo bajo control ✅</p>
                    <p className="text-sm text-gray-400 mt-1">
                        No hay alertas urgentes en este momento
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    🚨 Acciones Urgentes ({alerts.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
                    Ver todas
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
            <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-lg bg-white border ${getAlertBorderColor(
                            alert.type
                        )} flex items-start gap-3 hover:shadow-md transition-shadow`}
                    >
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900">{alert.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                        {alert.action && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(alert.action!.href)}
                                className="shrink-0"
                            >
                                {alert.action.label}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};
