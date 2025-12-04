import { supabase } from '@/integrations/supabase/client';

export interface PredictionData {
    date: string;
    actual?: number;
    predicted: number;
    confidence: number;
}

export interface ForecastRequest {
    timeRange?: 'day' | 'week' | 'month';
    productId?: number;
}

export interface ForecastResponse {
    predictions: PredictionData[];
}

export interface WastePrediction {
    productId: number;
    productName: string;
    currentStock: number;
    expirationDate: string;
    wasteRisk: 'low' | 'medium' | 'high';
    recommendedAction: string;
    confidence: number;
}

/**
 * Intelligence API Service
 * Handles all AI/ML-powered forecasting and prediction endpoints
 */
export class IntelligenceAPI {
    /**
     * Generate sales predictions using historical data
     */
    static async generateSalesPredictions(request: ForecastRequest = {}): Promise<ForecastResponse> {
        try {
            const { data, error } = await supabase.functions.invoke('generate-sales-predictions', {
                body: request,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error generating sales predictions:', error);
            // Return mock data as fallback
            return this.getMockPredictions(request.timeRange || 'week');
        }
    }

    /**
     * Predict waste risk for products
     */
    static async predictWaste(): Promise<WastePrediction[]> {
        try {
            const { data, error } = await supabase.functions.invoke('predict-waste');

            if (error) throw error;
            return data.predictions || [];
        } catch (error) {
            console.error('Error predicting waste:', error);
            // Return mock data as fallback
            return this.getMockWastePredictions();
        }
    }

    /**
     * Mock predictions for development/demo
     */
    private static getMockPredictions(timeRange: string): ForecastResponse {
        const intervals = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
        const predictions: PredictionData[] = [];
        const now = new Date();

        for (let i = 0; i < intervals; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);

            predictions.push({
                date: date.toISOString(),
                actual: i < intervals / 2 ? Math.random() * 1000 + 500 : undefined,
                predicted: Math.random() * 1000 + 600,
                confidence: Math.max(60, 95 - i * 2),
            });
        }

        return { predictions };
    }

    /**
     * Mock waste predictions for development/demo
     */
    private static getMockWastePredictions(): WastePrediction[] {
        return [
            {
                productId: 1,
                productName: 'Fresh Milk',
                currentStock: 45,
                expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                wasteRisk: 'high',
                recommendedAction: 'Discount by 30% or donate',
                confidence: 0.87,
            },
            {
                productId: 2,
                productName: 'Organic Bread',
                currentStock: 23,
                expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                wasteRisk: 'high',
                recommendedAction: 'Create surprise bag',
                confidence: 0.92,
            },
            {
                productId: 3,
                productName: 'Fresh Vegetables',
                currentStock: 67,
                expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                wasteRisk: 'medium',
                recommendedAction: 'Monitor closely',
                confidence: 0.75,
            },
        ];
    }
}
