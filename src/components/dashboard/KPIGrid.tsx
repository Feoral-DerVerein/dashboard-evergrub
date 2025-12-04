import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Package, AlertTriangle, TrendingUp, DollarSign, Heart } from 'lucide-react';
import type { KPIMetrics } from '@/types/dashboard';

// Icon mapping
const iconMap = {
    DollarSign,
    Package,
    TrendingUp,
    AlertTriangle,
    Heart,
};

interface KPIGridProps {
    metrics?: KPIMetrics;
    isLoading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, isLoading = false }) => {
    // Convert metrics object to array for mapping
    const kpiData = metrics ? [
        metrics.totalInventoryValue,
        metrics.activeProducts,
        metrics.wasteReduction,
        metrics.atRiskItems,
        ...(metrics.donatedMeals ? [metrics.donatedMeals] : []),
    ] : [];

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!metrics || kpiData.length === 0) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-full">
                    <CardContent className="pt-6 text-center text-gray-500">
                        No KPI data available. Inject some test data to get started.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((item, index) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || DollarSign;

                return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 border-gray-100 cursor-pointer group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {item.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${item.bg} group-hover:scale-110 transition-transform`}>
                                <IconComponent className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                {item.trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={item.trend === 'up' ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                    {item.change}
                                </span>
                                <span className="ml-1 text-gray-400">{item.description}</span>
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
