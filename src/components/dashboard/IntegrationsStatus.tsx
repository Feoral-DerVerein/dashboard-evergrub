import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, DollarSign, TrendingUp, Wifi } from 'lucide-react';
import type { Integration } from '@/types/dashboard';

// Icon mapping
const iconMap = {
    Wifi,
    Cloud,
    DollarSign,
    TrendingUp,
};

interface IntegrationsStatusProps {
    integrations?: Integration[];
    isLoading?: boolean;
}

export const IntegrationsStatus: React.FC<IntegrationsStatusProps> = ({
    integrations = [],
    isLoading = false
}) => {
    // Format last sync time
    const formatLastSync = (lastSync: Date | null) => {
        if (!lastSync) return 'Never';

        const now = new Date();
        const diffMs = now.getTime() - lastSync.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Get badge style based on status
    const getBadgeStyle = (status: string) => {
        switch (status) {
            case 'connected':
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'disconnected':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    if (isLoading) {
        return (
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Active Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-3 border rounded-lg animate-pulse">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-32 ml-10"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (integrations.length === 0) {
        return (
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Active Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-500 py-4">
                        No integrations configured yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Active Integrations</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                    {integrations.map((integration) => {
                        const IconComponent = iconMap[integration.icon as keyof typeof iconMap] || Wifi;

                        return (
                            <div
                                key={integration.id}
                                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${integration.bg}`}>
                                            <IconComponent className={`h-4 w-4 ${integration.color}`} />
                                        </div>
                                        <span className="font-medium text-gray-900">{integration.name}</span>
                                    </div>
                                    <Badge className={getBadgeStyle(integration.status)}>
                                        {integration.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-500 ml-10">
                                    Last sync: {formatLastSync(integration.lastSync)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
