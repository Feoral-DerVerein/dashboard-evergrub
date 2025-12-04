import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for stock trends by category
const stockData = [
    { category: 'Dairy', inStock: 450, lowStock: 23, outOfStock: 5 },
    { category: 'Produce', inStock: 320, lowStock: 45, outOfStock: 12 },
    { category: 'Meat', inStock: 280, lowStock: 18, outOfStock: 3 },
    { category: 'Bakery', inStock: 190, lowStock: 32, outOfStock: 8 },
    { category: 'Beverages', inStock: 410, lowStock: 15, outOfStock: 2 },
];

export const StockTrendsChart = () => {
    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Stock Status by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockData}>
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
                        <Bar dataKey="inStock" fill="#10b981" name="In Stock" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="lowStock" fill="#f59e0b" name="Low Stock" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="outOfStock" fill="#ef4444" name="Out of Stock" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
