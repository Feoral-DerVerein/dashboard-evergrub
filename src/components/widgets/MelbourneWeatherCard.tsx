import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Settings } from "lucide-react";

interface WeatherData {
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

const MelbourneWeatherCard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Map Open-Meteo weather codes to conditions
  const getWeatherCondition = (code: number): { condition: string; description: string } => {
    if (code === 0) return { condition: "clear", description: "Clear sky" };
    if (code <= 3) return { condition: "clouds", description: code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast" };
    if (code <= 48) return { condition: "clouds", description: "Foggy" };
    if (code <= 55) return { condition: "rain", description: "Drizzle" };
    if (code <= 65) return { condition: "rain", description: "Rain" };
    if (code <= 77) return { condition: "snow", description: "Snow" };
    if (code <= 82) return { condition: "rain", description: "Rain showers" };
    if (code <= 86) return { condition: "snow", description: "Snow showers" };
    return { condition: "rain", description: "Thunderstorm" };
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using Open-Meteo API for Melbourne (free, no API key required)
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&hourly=temperature_2m,weather_code&timezone=Australia/Melbourne&forecast_days=1'
        );
        
        if (response.ok) {
          const data = await response.json();
          const currentWeather = getWeatherCondition(data.current.weather_code);
          
          // Get next 4 hours forecast
          const currentHour = new Date().getHours();
          const forecast = [12, 15, 18, 21].map((hour) => {
            const hourIndex = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === hour);
            if (hourIndex !== -1) {
              const weatherInfo = getWeatherCondition(data.hourly.weather_code[hourIndex]);
              return {
                time: `${hour}:00`,
                temp: Math.round(data.hourly.temperature_2m[hourIndex]),
                condition: weatherInfo.condition
              };
            }
            return null;
          }).filter(Boolean) as Array<{ time: string; temp: number; condition: string; }>;
          
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            condition: currentWeather.condition,
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            feelsLike: Math.round(data.current.apparent_temperature),
            description: currentWeather.description,
            forecast: forecast
          });
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Fallback data for Melbourne
        setWeather({
          temperature: 16,
          condition: "clouds",
          humidity: 66,
          windSpeed: 19,
          feelsLike: 18,
          description: "Demo Weather Data - Add API Key For Real Data",
          forecast: [
            { time: "12:00", temp: 18, condition: "clear" },
            { time: "15:00", temp: 22, condition: "clouds" },
            { time: "18:00", temp: 19, condition: "clouds" },
            { time: "21:00", temp: 16, condition: "clouds" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string, size: "sm" | "lg" = "lg") => {
    const iconSize = size === "sm" ? "w-4 h-4" : "w-8 h-8";
    const iconColor = size === "sm" ? "" : "text-blue-500";
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className={`${iconSize} ${size === "sm" ? "text-yellow-500" : "text-yellow-400"}`} />;
      case 'clouds':
        return <Cloud className={`${iconSize} ${size === "sm" ? "text-gray-500" : "text-gray-300"}`} />;
      case 'rain':
        return <CloudRain className={`${iconSize} ${size === "sm" ? "text-blue-500" : "text-blue-400"}`} />;
      case 'snow':
        return <CloudSnow className={`${iconSize} ${size === "sm" ? "text-blue-300" : "text-white"}`} />;
      default:
        return <Cloud className={`${iconSize} ${size === "sm" ? "text-gray-500" : "text-gray-300"}`} />;
    }
  };

  if (loading) {
    return (
      <div className="w-48 h-auto bg-black/20 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="w-auto bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-blue-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {getWeatherIcon(weather.condition)}
        <div>
          <p className="text-base font-semibold text-blue-900">Melbourne Weather Live</p>
        </div>
        <button className="ml-auto p-1 hover:bg-blue-100 rounded-md transition-colors">
          <Settings className="w-3 h-3 text-blue-600" />
        </button>
      </div>

      {/* Temperature */}
      <div className="mb-2">
        <span className="text-5xl font-bold text-blue-900">{weather.temperature}°C</span>
        <p className="text-sm text-blue-600 capitalize mt-1">{weather.description}</p>
        <p className="text-xs text-blue-500 mt-1">Feels like {weather.feelsLike}°C</p>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600">{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600">{weather.windSpeed} km/h</span>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="bg-blue-50 rounded-lg p-3 mb-2">
        <p className="text-sm text-blue-800 font-semibold mb-2">Today's Forecast</p>
        <div className="grid grid-cols-4 gap-2">
          {weather.forecast.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-blue-700 font-medium">{item.time}</p>
              <div className="my-1 flex justify-center">
                {getWeatherIcon(item.condition, "sm")}
              </div>
              <p className="text-sm font-semibold text-blue-800">{item.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom message */}
      <div className="bg-green-50 rounded-lg p-2">
        <p className="text-sm text-green-800">
          {weather.temperature > 20 ? "☕ Perfect for warm drinks" : "☕ Perfect for warm drinks"}
        </p>
      </div>
    </div>
  );
};

export default MelbourneWeatherCard;