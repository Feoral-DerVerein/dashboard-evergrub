import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { IntelligenceAPI, WastePrediction } from '@/services/api/intelligence';
import { useTranslation } from 'react-i18next';

export const AIInsights = () => {
    const { t } = useTranslation();
    const [wastePredictions, setWastePredictions] = useState<WastePrediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPredictions();
    }, []);

    const loadPredictions = async () => {
        try {
            const predictions = await IntelligenceAPI.predictWaste();
            setWastePredictions(predictions);
        } catch (error) {
            console.error('Failed to load predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'high': return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
            case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        {t('dashboard.ai_insights')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-gray-500 py-8">{t('dashboard.loading')}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    {t('dashboard.ai_insights')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {wastePredictions.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">{t('dashboard.no_risks')}</div>
                    ) : (
                        wastePredictions.map((prediction) => (
                            <div
                                key={prediction.productId}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getRiskIcon(prediction.wasteRisk)}
                                            <h4 className="font-semibold text-gray-900">{prediction.productName}</h4>
                                            <Badge className={getRiskColor(prediction.wasteRisk)}>
                                                {prediction.wasteRisk.toUpperCase()} {t('dashboard.risk_suffix')}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>{t('dashboard.stock')}: <span className="font-medium">{prediction.currentStock} units</span></p>
                                            <p>{t('dashboard.expires')}: <span className="font-medium">
                                                {new Date(prediction.expirationDate).toLocaleDateString()}
                                            </span></p>
                                            <p className="text-purple-600 font-medium">
                                                💡 {prediction.recommendedAction}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">{t('dashboard.confidence')}</div>
                                        <div className="text-lg font-bold text-purple-600">
                                            {Math.round(prediction.confidence * 100)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
