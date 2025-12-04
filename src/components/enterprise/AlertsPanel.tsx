import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { enterpriseService } from '@/services/enterpriseService';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AlertsPanel = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await enterpriseService.getAlerts();
                setAlerts(data || []);
            } catch (error) {
                console.error("Failed to fetch alerts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        System Alerts
                    </CardTitle>
                    <Badge variant="secondary">{alerts.length} Active</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No active alerts
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1">{getIcon(alert.type)}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(alert.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="capitalize text-xs">
                                        {alert.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
