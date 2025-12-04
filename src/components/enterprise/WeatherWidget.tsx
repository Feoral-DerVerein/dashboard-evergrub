import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { enterpriseService } from '@/services/enterpriseService';

export const WeatherWidget = () => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await enterpriseService.getCurrentWeather();
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Local Weather</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
                </CardContent>
            </Card>
        );
    }

    if (!weather) return null;

    const getWeatherIcon = (code: string) => {
        if (code?.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
        if (code?.includes('cloud')) return <Cloud className="h-8 w-8 text-gray-500" />;
        return <Sun className="h-8 w-8 text-yellow-500" />;
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Local Weather</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getWeatherIcon(weather.weather_code)}
                        <div>
                            <div className="text-2xl font-bold">{weather.temperature}°C</div>
                            <div className="text-xs text-gray-500 capitalize">{weather.weather_code}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-blue-600 flex items-center justify-end gap-1">
                            <CloudRain className="h-3 w-3" /> {weather.humidity}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Impact: Low
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
