import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for demand forecasting
const demandData = [
    { date: 'Mon', actual: 120, forecast: 115, confidence: 10 },
    { date: 'Tue', actual: 132, forecast: 128, confidence: 12 },
    { date: 'Wed', actual: 145, forecast: 142, confidence: 15 },
    { date: 'Thu', actual: 138, forecast: 145, confidence: 14 },
    { date: 'Fri', actual: 165, forecast: 158, confidence: 18 },
    { date: 'Sat', actual: null, forecast: 172, confidence: 20 },
    { date: 'Sun', actual: null, forecast: 180, confidence: 22 },
];

export const DemandForecastChart = () => {
    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Demand Forecast (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={demandData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
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
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            name="Actual Demand"
                        />
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#10b981', r: 4 }}
                            name="Forecasted Demand"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
