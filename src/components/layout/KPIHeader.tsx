import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';

export const KPIHeader = () => {
    return (
        <div className="flex items-center space-x-4 ml-4 overflow-x-auto py-1">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">Stock Value</span>
                <span className="text-sm font-bold text-blue-700">$124,500</span>
            </div>

            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">Demand (24h)</span>
                <span className="text-sm font-bold text-green-700">+12%</span>
            </div>

            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-gray-500 uppercase">Waste Risk</span>
                <span className="text-sm font-bold text-red-700">High (3 items)</span>
            </div>
        </div>
    );
};
