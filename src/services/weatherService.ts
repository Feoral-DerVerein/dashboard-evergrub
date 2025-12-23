
export interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    description: string;
    feelsLike: number;
    forecast: Array<{
        time: string;
        temp: number;
        condition: string;
    }>;
}

export const weatherService = {
    getWeatherCondition(code: number): { condition: string; description: string } {
        if (code === 0) return { condition: "clear", description: "Clear sky" };
        if (code <= 3) return { condition: "clouds", description: code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast" };
        if (code <= 48) return { condition: "clouds", description: "Foggy" };
        if (code <= 55) return { condition: "rain", description: "Drizzle" };
        if (code <= 65) return { condition: "rain", description: "Rain" };
        if (code <= 77) return { condition: "snow", description: "Snow" };
        if (code <= 82) return { condition: "rain", description: "Rain showers" };
        if (code <= 86) return { condition: "snow", description: "Snow showers" };
        return { condition: "rain", description: "Thunderstorm" };
    },

    async fetchWeather(lat: number, lon: number, timezone: string = 'auto'): Promise<WeatherData | null> {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&hourly=temperature_2m,weather_code&timezone=${timezone}&forecast_days=1`
            );

            if (!response.ok) throw new Error('Weather API request failed');

            const data = await response.json();
            const currentWeather = this.getWeatherCondition(data.current.weather_code);

            const forecast = [12, 15, 18, 21].map((hour) => {
                const hourIndex = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === hour);
                if (hourIndex !== -1) {
                    const weatherInfo = this.getWeatherCondition(data.hourly.weather_code[hourIndex]);
                    return {
                        time: `${hour}:00`,
                        temp: Math.round(data.hourly.temperature_2m[hourIndex]),
                        condition: weatherInfo.condition
                    };
                }
                return null;
            }).filter(Boolean) as Array<{ time: string; temp: number; condition: string; }>;

            return {
                temperature: Math.round(data.current.temperature_2m),
                condition: currentWeather.condition,
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                feelsLike: Math.round(data.current.apparent_temperature),
                description: currentWeather.description,
                forecast: forecast
            };
        } catch (error) {
            console.error('Error in weatherService:', error);
            return null;
        }
    }
};
