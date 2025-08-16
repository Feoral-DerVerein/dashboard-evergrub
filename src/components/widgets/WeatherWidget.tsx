import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: "sunny",
    humidity: 65,
    windSpeed: 8,
    description: "Partly cloudy"
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "cloudy":
      case "partly cloudy":
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case "rainy":
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case "snowy":
      case "snow":
        return <CloudSnow className="w-8 h-8 text-blue-300" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  // Simulate real-time weather updates
  useEffect(() => {
    const updateWeather = () => {
      const conditions = ["sunny", "partly cloudy", "cloudy", "rainy"];
      const temperatures = [18, 20, 22, 25, 28];
      const humidities = [45, 55, 65, 70, 75];
      const windSpeeds = [5, 8, 12, 15];
      
      setWeather({
        temperature: temperatures[Math.floor(Math.random() * temperatures.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: humidities[Math.floor(Math.random() * humidities.length)],
        windSpeed: windSpeeds[Math.floor(Math.random() * windSpeeds.length)],
        description: "Current conditions"
      });
    };

    const interval = setInterval(updateWeather, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/80 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          {getWeatherIcon(weather.condition)}
          Real-Time Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
              <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Wind: {weather.windSpeed} km/h</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              Perfect weather for {weather.temperature > 20 ? "outdoor dining" : "cozy indoor atmosphere"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;