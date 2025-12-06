import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Tag, Heart, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrescriptiveActionsProps {
    salesHistory: any[]; // Forecast data
    stockByCategory: any[]; // Inventory data
    scenario: 'base' | 'optimistic' | 'crisis';
    isLoading?: boolean;
}

interface ActionItem {
    id: string;
    type: 'restock' | 'promo' | 'donate';
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
}

export const PrescriptiveActions: React.FC<PrescriptiveActionsProps> = ({
    salesHistory = [],
    stockByCategory = [],
    scenario,
    isLoading
}) => {
    const { t } = useTranslation();

    // Mock logic to derive actions from props
    // In a real app, we'd match SKUs. Here we use category/aggregate patterns.
    const generateActions = (): ActionItem[] => {
        const actions: ActionItem[] = [];
        const totalForecast = salesHistory.reduce((sum, item) => sum + (item.forecast || 0), 0);

        // Logic 1: Restock (High Demand)
        // If forecast is high (arbitrary threshold or relative to scenario)
        if (scenario === 'optimistic' || totalForecast > 5000) {
            actions.push({
                id: '1',
                type: 'restock',
                title: 'Increase Dairy Orders',
                description: `Projected demand spike (+20%) detected for next week.`,
                impact: 'Prevent $1.2k lost revenue',
                priority: 'high'
            });
        }

        // Logic 2: Promo (Surplus)
        // If we have high stock in some categories
        const highStockCat = stockByCategory.find(c => c.inStock > 100);
        if (highStockCat || scenario === 'crisis') {
            actions.push({
                id: '2',
                type: 'promo',
                title: highStockCat ? `Flash Sale: ${highStockCat.category}` : 'Clearance Sale',
                description: highStockCat ? `Overstock detected in ${highStockCat.category}.` : 'Slow demand expected.',
                impact: 'Reduce waste by 15%',
                priority: 'medium'
            });
        }

        // Logic 3: Donate (Risk)
        // Always suggest if we have risk factors, amplified by crisis
        actions.push({
            id: '3',
            type: 'donate',
            title: 'Schedule Donation Pickup',
            description: '24 items approaching expiration in Produce.',
            impact: 'Compliance + Tax Benefit',
            priority: 'low'
        });

        return actions;
    };

    const actions = generateActions();

    if (isLoading) {
        return <Card className="animate-pulse h-[300px]"><CardHeader className="h-10 bg-gray-100 rounded-t-lg" /></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span role="img" aria-label="bulb">💡</span>
                        {t('actions.title')}
                    </CardTitle>
                    <Badge variant={scenario === 'optimistic' ? 'default' : scenario === 'crisis' ? 'destructive' : 'secondary'}>
                        {scenario.toUpperCase()} MODE
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {actions.map(action => (
                    <div key={action.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4 items-start">
                            <div className={`p-2 rounded-full ${action.type === 'restock' ? 'bg-blue-100 text-blue-600' :
                                action.type === 'promo' ? 'bg-orange-100 text-orange-600' :
                                    'bg-pink-100 text-pink-600'
                                }`}>
                                {action.type === 'restock' && <ShoppingCart size={20} />}
                                {action.type === 'promo' && <Tag size={20} />}
                                {action.type === 'donate' && <Heart size={20} />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                <p className="text-sm text-gray-500">{action.description}</p>
                                <p className="text-xs font-medium text-green-600 mt-1">{action.impact}</p>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            {action.type === 'restock' && <Button size="sm" variant="outline">Review Order <ArrowRight size={14} className="ml-2" /></Button>}
                            {action.type === 'promo' && <Button size="sm" variant="secondary">Create Campaign <ArrowRight size={14} className="ml-2" /></Button>}
                            {action.type === 'donate' && <Button size="sm" variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50">Log Donation <ArrowRight size={14} className="ml-2" /></Button>}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
