import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Tag, Heart, ArrowRight, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { smartInventoryService, PrescriptiveAction } from '@/services/SmartInventoryService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface PrescriptiveActionsProps {
    salesHistory?: any[]; // Keep for compatibility but optional
    stockByCategory?: any[]; // Keep for compatibility but optional
    scenario: 'base' | 'optimistic' | 'crisis';
}

export const PrescriptiveActions: React.FC<PrescriptiveActionsProps> = ({
    scenario
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [actions, setActions] = useState<PrescriptiveAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingId, setExecutingId] = useState<string | null>(null);

    const fetchActions = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const realActions = await smartInventoryService.generatePrescriptiveActions(user.id);

            // If no real actions found, maybe fallback to some scenario-based mocks or show empty state?
            // For demo purposes, we can mix in scenario actions if list is empty
            if (realActions.length === 0 && scenario === 'crisis') {
                realActions.push({
                    id: 'scenario-mock-1',
                    type: 'promo',
                    title: 'Liquidation Event',
                    description: 'Crisis mode active: Recommended to clear slow-moving stock.',
                    impact: 'Unlock cash flow',
                    priority: 'high'
                });
            }

            setActions(realActions);
        } catch (error) {
            console.error("Failed to fetch prescriptive actions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, [user, scenario]);

    const handleExecute = async (action: PrescriptiveAction) => {
        setExecutingId(action.id);
        const success = await smartInventoryService.executeAction(action);

        if (success) {
            toast.success(`Action executed: ${action.title}`);
            // Remove action from list or mark as done
            setActions(prev => prev.filter(a => a.id !== action.id));
        } else {
            toast.error("Failed to execute action");
        }
        setExecutingId(null);
    };

    if (loading) {
        return <Card className="animate-pulse h-[300px]"><CardHeader className="h-10 bg-gray-100 rounded-t-lg" /><CardContent className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></CardContent></Card>;
    }

    if (actions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <span role="img" aria-label="bulb">💡</span>
                        {t('actions.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-gray-500">
                    <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p>No critical actions needed. Everything looks good!</p>
                </CardContent>
            </Card>
        );
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
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    {action.title}
                                    {action.productId && <Badge variant="outline" className="text-xs">Automatic</Badge>}
                                </h4>
                                <p className="text-sm text-gray-500">{action.description}</p>
                                <p className="text-xs font-medium text-green-600 mt-1">{action.impact}</p>
                                {action.suggestedPrice && (
                                    <div className="text-xs text-orange-600 font-semibold mt-1">
                                        Suggested Price: ${action.suggestedPrice} (was ${action.currentPrice})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            <Button
                                size="sm"
                                variant={action.type === 'promo' ? "default" : "outline"}
                                onClick={() => handleExecute(action)}
                                disabled={!!executingId}
                            >
                                {executingId === action.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {action.type === 'promo' ? 'Apply Price' : 'Execute'}
                                        <ArrowRight size={14} className="ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
