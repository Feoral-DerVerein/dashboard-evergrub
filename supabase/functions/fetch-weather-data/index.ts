import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, city } = await req.json();
    console.log('Fetching weather for:', { latitude, longitude, city });

    // Use city name or coordinates
    let weatherUrl = '';
    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`;
    } else if (latitude && longitude) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`;
    } else {
      // Default to Melbourne
      weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Melbourne&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`;
    }

    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather data fetched successfully');

    // Process forecast data (next 7 days)
    const forecast = [];
    const processedDates = new Set();
    
    for (const item of weatherData.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Only take one forecast per day (at noon)
      if (!processedDates.has(dateStr) && forecast.length < 7) {
        processedDates.add(dateStr);
        forecast.push({
          date: date.toISOString(),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        });
      }
    }

    const currentTemp = forecast[0]?.temp || 20;
    
    // Generate product recommendations based on temperature
    const recommendedProducts = currentTemp > 25
      ? [
          { name: 'Ice Cream', category: 'Desserts', reason: 'High temperature' },
          { name: 'Cold Beverages', category: 'Drinks', reason: 'Hot weather' },
          { name: 'Salads', category: 'Meals', reason: 'Summer season' },
          { name: 'Fresh Fruit', category: 'Produce', reason: 'Hot weather' },
        ]
      : currentTemp > 15
      ? [
          { name: 'Coffee', category: 'Drinks', reason: 'Moderate temperature' },
          { name: 'Sandwiches', category: 'Meals', reason: 'Mild weather' },
          { name: 'Pastries', category: 'Bakery', reason: 'Pleasant weather' },
        ]
      : [
          { name: 'Soups', category: 'Meals', reason: 'Cold weather' },
          { name: 'Hot Coffee', category: 'Drinks', reason: 'Low temperature' },
          { name: 'Hot Chocolate', category: 'Drinks', reason: 'Cool climate' },
          { name: 'Warm Bread', category: 'Bakery', reason: 'Cold weather' },
        ];

    return new Response(
      JSON.stringify({
        temperature: currentTemp,
        forecast,
        recommendedProducts,
        location: weatherData.city.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-weather-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
