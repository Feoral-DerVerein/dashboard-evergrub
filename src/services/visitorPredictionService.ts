import { supabase } from "@/integrations/supabase/client";

export interface VisitorPredictionData {
  expectedVisitors: number;
  confidence: number;
  peakHour: string;
  trend: "up" | "down" | "stable";
  factors: string[];
}

interface WeatherData {
  current: { temp: number; condition: string; };
  forecast: Array<{ date: string; temp: number; condition: string; }>;
}

export const visitorPredictionService = {
  async getPrediction(): Promise<VisitorPredictionData> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const currentHour = today.getHours();
      
      // Get historical orders for the last 60 days
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get upcoming events
      const { data: events } = await supabase
        .from('events_calendar')
        .select('*')
        .gte('event_date', today.toISOString().split('T')[0])
        .lte('event_date', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      // Fetch weather data
      let weatherData: WeatherData | null = null;
      try {
        const { data: weatherResponse } = await supabase.functions.invoke('fetch-weather-data', {
          body: { city: 'Melbourne' }
        });
        weatherData = weatherResponse;
      } catch (weatherError) {
        console.warn('Weather data unavailable:', weatherError);
      }

      // Calculate base statistics from historical data
      const ordersToday = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        return orderDate.toDateString() === today.toDateString();
      }) || [];

      // Group orders by day of week and weather conditions
      const ordersByDayOfWeek = orders?.reduce((acc, order) => {
        const orderDate = new Date(order.created_at!);
        const orderDay = orderDate.getDay();
        if (!acc[orderDay]) acc[orderDay] = [];
        acc[orderDay].push(order);
        return acc;
      }, {} as Record<number, any[]>) || {};

      // Calculate average visitors for current day of week
      const sameDayOrders = ordersByDayOfWeek[dayOfWeek] || [];
      const avgVisitorsForDay = Math.round(sameDayOrders.length / 8) || 0; // 8 weeks of data

      // Find peak hour based on historical data
      const ordersByHour = orders?.reduce((acc, order) => {
        const orderDate = new Date(order.created_at!);
        const hour = orderDate.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      const peakHourNum = Object.entries(ordersByHour)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 19;
      
      const peakHour = `${peakHourNum}:00`;

      // Calculate trend based on last 2 weeks vs previous 2 weeks
      const lastTwoWeeks = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 14;
      }).length || 0;

      const previousTwoWeeks = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo > 14 && daysAgo <= 28;
      }).length || 0;

      let trend: "up" | "down" | "stable" = "stable";
      if (lastTwoWeeks > previousTwoWeeks * 1.15) trend = "up";
      else if (lastTwoWeeks < previousTwoWeeks * 0.85) trend = "down";

      // Start with base prediction
      let expectedVisitors = avgVisitorsForDay;
      let confidenceScore = 60;
      const factors: string[] = [];

      // Weather impact analysis
      if (weatherData) {
        const currentTemp = weatherData.current.temp;
        const condition = weatherData.current.condition.toLowerCase();
        
        // Temperature impact (optimal range 15-25°C)
        if (currentTemp >= 15 && currentTemp <= 25) {
          expectedVisitors *= 1.15;
          factors.push(`Clima ideal (${Math.round(currentTemp)}°C)`);
          confidenceScore += 10;
        } else if (currentTemp < 10) {
          expectedVisitors *= 0.85;
          factors.push(`Frío (${Math.round(currentTemp)}°C)`);
          confidenceScore += 5;
        } else if (currentTemp > 30) {
          expectedVisitors *= 0.90;
          factors.push(`Calor (${Math.round(currentTemp)}°C)`);
          confidenceScore += 5;
        }

        // Weather condition impact
        if (condition.includes('rain') || condition.includes('storm')) {
          expectedVisitors *= 0.75;
          factors.push("Lluvia/Tormenta");
          confidenceScore += 8;
        } else if (condition.includes('sunny') || condition.includes('clear')) {
          expectedVisitors *= 1.10;
          factors.push("Soleado");
          confidenceScore += 8;
        }
      }

      // Day of week impact
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        expectedVisitors *= 1.25;
        factors.push("Fin de semana");
        confidenceScore += 5;
      } else if (dayOfWeek === 5) {
        expectedVisitors *= 1.15;
        factors.push("Viernes");
        confidenceScore += 5;
      } else {
        factors.push("Día laboral");
      }

      // Time of day impact
      if (currentHour >= 18 && currentHour <= 21) {
        expectedVisitors *= 1.20;
        factors.push("Hora pico nocturna");
      } else if (currentHour >= 12 && currentHour <= 14) {
        expectedVisitors *= 1.10;
        factors.push("Hora de almuerzo");
      } else if (currentHour >= 6 && currentHour <= 10) {
        expectedVisitors *= 0.95;
        factors.push("Mañana temprana");
      }

      // Events impact
      const todayEvents = events?.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.toDateString() === today.toDateString();
      }) || [];

      if (todayEvents.length > 0) {
        const highImpactEvents = todayEvents.filter(e => e.impact_level === 'high');
        const mediumImpactEvents = todayEvents.filter(e => e.impact_level === 'medium');
        
        if (highImpactEvents.length > 0) {
          expectedVisitors *= 1.40;
          factors.push(`Evento especial: ${highImpactEvents[0].event_name}`);
          confidenceScore += 15;
        } else if (mediumImpactEvents.length > 0) {
          expectedVisitors *= 1.20;
          factors.push(`Evento: ${mediumImpactEvents[0].event_name}`);
          confidenceScore += 10;
        }
      }

      // Trend impact
      if (trend === "up") {
        expectedVisitors *= 1.08;
        factors.push("Tendencia creciente");
      } else if (trend === "down") {
        expectedVisitors *= 0.92;
        factors.push("Tendencia decreciente");
      }

      // Add current real orders to prediction
      expectedVisitors += ordersToday.length;
      
      // Calculate final confidence (max 95%)
      const dataPoints = orders?.length || 0;
      confidenceScore += Math.min(20, dataPoints / 10);
      confidenceScore = Math.min(95, Math.max(50, confidenceScore));

      // Ensure minimum realistic value
      expectedVisitors = Math.max(Math.round(expectedVisitors), ordersToday.length || 5);

      return {
        expectedVisitors,
        confidence: Math.round(confidenceScore),
        peakHour,
        trend,
        factors: factors.slice(0, 5) // Limit to top 5 factors
      };
    } catch (error) {
      console.error('Error calculating visitor prediction:', error);
      
      return {
        expectedVisitors: 0,
        confidence: 0,
        peakHour: "19:00",
        trend: "stable",
        factors: ["Insuficientes datos históricos"]
      };
    }
  }
};
