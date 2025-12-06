import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { SalesHistoryItem } from '@/types/dashboard';

interface DemandForecastChartProps {
    data?: SalesHistoryItem[];
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({ data = [] }) => {
    const { t } = useTranslation();

    const hasData = data && data.length > 0;

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">{t('dashboard.forecast.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {!hasData ? (
                        <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                            <p className="text-sm font-medium">No forecast data available yet</p>
                            <p className="text-xs mt-1 opacity-70">Connect POS to see real predictions</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    name={t('dashboard.forecast.actual')}
                                    connectNulls
                                />
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: '#10b981', r: 4 }}
                                    name={t('dashboard.forecast.forecasted')}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
