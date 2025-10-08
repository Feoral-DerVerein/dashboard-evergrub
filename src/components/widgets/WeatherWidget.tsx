import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  city: string;
  feelsLike: number;
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
  }>;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: "sunny",
    humidity: 65,
    windSpeed: 8,
    description: "Loading Melbourne weather...",
    city: "Melbourne, AU",
    feelsLike: 24,
    forecast: []
  });
  const [loading, setLoading] = useState(true);

  // Map Open-Meteo weather codes to conditions
  const getWeatherCondition = (code: number): { condition: string; description: string } => {
    if (code === 0) return { condition: "sunny", description: "Clear sky" };
    if (code <= 3) return { condition: "partly cloudy", description: code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast" };
    if (code <= 48) return { condition: "cloudy", description: "Foggy" };
    if (code <= 55) return { condition: "rainy", description: "Drizzle" };
    if (code <= 65) return { condition: "rainy", description: "Rain" };
    if (code <= 77) return { condition: "snowy", description: "Snow" };
    if (code <= 82) return { condition: "rainy", description: "Rain showers" };
    if (code <= 86) return { condition: "snowy", description: "Snow showers" };
    return { condition: "rainy", description: "Thunderstorm" };
  };

  const getWeatherIcon = (condition: string, size: "sm" | "lg" = "lg") => {
    const iconSize = size === "sm" ? "w-4 h-4" : "w-8 h-8";
    
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className={`${iconSize} text-yellow-500`} />;
      case "cloudy":
      case "partly cloudy":
        return <Cloud className={`${iconSize} text-gray-500`} />;
      case "rainy":
      case "rain":
        return <CloudRain className={`${iconSize} text-blue-500`} />;
      case "snowy":
      case "snow":
        return <CloudSnow className={`${iconSize} text-blue-300`} />;
      default:
        return <Sun className={`${iconSize} text-yellow-500`} />;
    }
  };

  // Fetch real weather data for Melbourne using Open-Meteo API
  const fetchWeather = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia/Melbourne&forecast_days=5'
      );

      if (response.ok) {
        const data = await response.json();
        
        const currentWeather = getWeatherCondition(data.current.weather_code);
        
        // Create 5-day forecast
        const forecast = data.daily.time.map((date: string, index: number) => {
          const weatherInfo = getWeatherCondition(data.daily.weather_code[index]);
          return {
            date: new Date(date).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' }),
            tempMax: Math.round(data.daily.temperature_2m_max[index]),
            tempMin: Math.round(data.daily.temperature_2m_min[index]),
            condition: weatherInfo.condition
          };
        });

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          condition: currentWeather.condition,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          feelsLike: Math.round(data.current.apparent_temperature),
          description: currentWeather.description,
          city: "Melbourne, AU",
          forecast: forecast
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather({
        temperature: 16,
        condition: "partly cloudy",
        humidity: 66,
        windSpeed: 19,
        feelsLike: 18,
        description: "Demo Weather Data - Add API Key For Real Data",
        city: "Melbourne, AU",
        forecast: [
          { date: "Today", tempMax: 22, tempMin: 16, condition: "sunny" },
          { date: "Tomorrow", tempMax: 20, tempMin: 14, condition: "cloudy" },
          { date: "Thu", tempMax: 19, tempMin: 15, condition: "partly cloudy" },
          { date: "Fri", tempMax: 21, tempMin: 16, condition: "sunny" },
          { date: "Sat", tempMax: 18, tempMin: 13, condition: "rainy" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/80 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-900">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.condition)}
            Melbourne Weather Live
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold text-blue-900">{weather.temperature}°C</p>
              <p className="text-sm text-blue-600 capitalize mt-1">{weather.description}</p>
              <p className="text-xs text-blue-500 mt-1">Feels like {weather.feelsLike}°C</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600">{weather.windSpeed} km/h</span>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-semibold mb-3">Today's Forecast</p>
            <div className="grid grid-cols-4 gap-2">
              {weather.forecast.slice(0, 4).map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-blue-700 font-medium">{index === 0 ? "12:00" : index === 1 ? "15:00" : index === 2 ? "18:00" : "21:00"}</p>
                  <div className="my-1 flex justify-center">
                    {getWeatherIcon(item.condition, "sm")}
                  </div>
                  <p className="text-sm font-semibold text-blue-800">{item.tempMax}°</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-sm text-green-800">
              {weather.temperature > 20 ? "☀️ Great for outdoor seating" : "☕ Perfect for warm drinks"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;