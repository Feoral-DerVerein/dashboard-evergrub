import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Settings, MapPin } from "lucide-react";
import { HelpTooltip } from "@/components/dashboard/HelpTooltip";
import { weatherService, WeatherData } from "@/services/weatherService";
import { storeProfileService } from "@/services/storeProfileService";
import { useAuth } from "@/context/AuthContext";

const LocalWeatherCard = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Local");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        let lat = -37.8136; // Default Melbourne
        let lon = 144.9631;
        let name = "Local";

        if (user) {
          const profile = await storeProfileService.getStoreProfile(user.uid);
          if (profile) {
            name = profile.name;
            if (profile.latitude && profile.longitude) {
              lat = profile.latitude;
              lon = profile.longitude;
            }
          }
        }

        setLocationName(name);
        const data = await weatherService.fetchWeather(lat, lon);

        if (data) {
          setWeather(data);
        } else {
          throw new Error('Fallback needed');
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Fallback or demo data
        setWeather({
          temperature: 22,
          condition: "clear",
          humidity: 45,
          windSpeed: 10,
          feelsLike: 23,
          description: "Clear sky (Demo)",
          forecast: [
            { time: "12:00", temp: 24, condition: "clear" },
            { time: "15:00", temp: 26, condition: "clouds" },
            { time: "18:00", temp: 22, condition: "clouds" },
            { time: "21:00", temp: 19, condition: "clear" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 mins
    return () => clearInterval(interval);
  }, [user]);

  const getWeatherIcon = (condition: string, size: "sm" | "lg" = "lg") => {
    const iconSize = size === "sm" ? "w-4 h-4" : "w-8 h-8";

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

  if (loading && !weather) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {getWeatherIcon(weather.condition)}
        <div>
          <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            {locationName} Weather
            <HelpTooltip kpiName="Meteorología Local" />
          </p>
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
          <span className="text-sm text-blue-600">{weather.humidity}% Hum</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600">{weather.windSpeed} km/h</span>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="bg-blue-50/50 rounded-lg p-3 mb-2 border border-blue-100/50">
        <p className="text-[10px] uppercase tracking-wider text-blue-800 font-bold mb-2">Next Hours</p>
        <div className="grid grid-cols-4 gap-2">
          {weather.forecast.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-[10px] text-blue-700 font-medium">{item.time}</p>
              <div className="my-1 flex justify-center">
                {getWeatherIcon(item.condition, "sm")}
              </div>
              <p className="text-sm font-bold text-blue-800">{item.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Insight */}
      <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
        <p className="text-[11px] text-amber-800 font-medium italic">
          AI Tip: {weather.temperature < 15 ? "Higher demand for hot drinks likely." : "Iced beverage promos recommended today."}
        </p>
      </div>
    </div>
  );
};

export default LocalWeatherCard;