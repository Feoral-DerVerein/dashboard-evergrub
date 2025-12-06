import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { StockCategoryItem } from '@/types/dashboard';

interface StockTrendsChartProps {
    data?: StockCategoryItem[];
}

export const StockTrendsChart: React.FC<StockTrendsChartProps> = ({ data = [] }) => {
    const { t } = useTranslation();

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">{t('dashboard.stock_trends_title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="category"
                            stroke="#888888"
                            fontSize={12}
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
                        <Bar dataKey="inStock" fill="#10b981" name={t('dashboard.legend.in_stock')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="lowStock" fill="#f59e0b" name={t('dashboard.legend.low_stock')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="outOfStock" fill="#ef4444" name={t('dashboard.legend.out_of_stock')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
