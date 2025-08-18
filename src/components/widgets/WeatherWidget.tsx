import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  city: string;
  feelsLike: number;
  pressure: number;
  forecast: Array<{
    time: string;
    temp: number;
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
    pressure: 1013,
    forecast: []
  });
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openweather-api-key') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

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

  const saveApiKey = () => {
    localStorage.setItem('openweather-api-key', apiKeyInput);
    setApiKey(apiKeyInput);
    setShowConfig(false);
    fetchWeather();
  };

  // Fetch real weather data for Melbourne with forecast
  const fetchWeather = async () => {
    try {
      setLoading(true);
      const currentApiKey = apiKey || apiKeyInput;
      
      if (!currentApiKey) {
        // Use demo data when no API key
        setWeather({
          temperature: Math.round(15 + Math.random() * 10),
          condition: ["cloudy", "partly cloudy", "sunny", "rainy"][Math.floor(Math.random() * 4)],
          humidity: Math.round(60 + Math.random() * 20),
          windSpeed: Math.round(10 + Math.random() * 15),
          feelsLike: Math.round(16 + Math.random() * 10),
          pressure: Math.round(1010 + Math.random() * 20),
          description: "Demo weather data - Add API key for real data",
          city: "Melbourne, AU",
          forecast: [
            { time: "12:00", temp: 18, condition: "sunny" },
            { time: "15:00", temp: 22, condition: "cloudy" },
            { time: "18:00", temp: 19, condition: "partly cloudy" },
            { time: "21:00", temp: 16, condition: "cloudy" }
          ]
        });
        setLoading(false);
        return;
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&appid=${currentApiKey}&units=metric`
      );
      
      // Fetch 5-day forecast (we'll use today's data)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=Melbourne,AU&appid=${currentApiKey}&units=metric`
      );

      if (currentResponse.ok && forecastResponse.ok) {
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        // Get next 4 forecasts for today
        const todayForecasts = forecastData.list.slice(0, 4).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('en-AU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main.toLowerCase()
        }));

        setWeather({
          temperature: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main.toLowerCase(),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          feelsLike: Math.round(currentData.main.feels_like),
          pressure: currentData.main.pressure,
          description: currentData.weather[0].description,
          city: "Melbourne, AU",
          forecast: todayForecasts
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      // Fallback to realistic Melbourne weather simulation
      setWeather({
        temperature: Math.round(15 + Math.random() * 10),
        condition: "partly cloudy",
        humidity: 65,
        windSpeed: 12,
        feelsLike: Math.round(16 + Math.random() * 10),
        pressure: 1015,
        description: "Unable to fetch live data",
        city: "Melbourne, AU",
        forecast: [
          { time: "12:00", temp: 18, condition: "sunny" },
          { time: "15:00", temp: 22, condition: "cloudy" },
          { time: "18:00", temp: 19, condition: "partly cloudy" },
          { time: "21:00", temp: 16, condition: "cloudy" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [apiKey]);

  return (
    <>
      <Card className="bg-white/80 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-900">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.condition)}
              Melbourne Weather Live
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(true)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
                <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
                <p className="text-xs text-gray-500">Feels like {weather.feelsLike}°C</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{weather.windSpeed} km/h</span>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium mb-2">Today's Forecast</p>
              <div className="grid grid-cols-4 gap-2">
                {weather.forecast.map((item, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-blue-700">{item.time}</p>
                    <div className="my-1 flex justify-center">
                      {getWeatherIcon(item.condition, "sm")}
                    </div>
                    <p className="text-xs font-medium text-blue-800">{item.temp}°</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-green-800">
                {weather.temperature > 20 ? "☀️ Great for outdoor seating" : "☕ Perfect for warm drinks"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weather API Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Add your OpenWeatherMap API key for real-time weather data.
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Get a free API key at: openweathermap.org/api
              </p>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="mb-3"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveApiKey} className="flex-1">
                Save API Key
              </Button>
              <Button variant="outline" onClick={() => setShowConfig(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeatherWidget;