import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { storeProfileService } from './storeProfileService';
import { weatherService, WeatherData } from './weatherService';

export interface VisitorPredictionData {
  expectedVisitors: number;
  confidence: number;
  peakHour: string;
  trend: "up" | "down" | "stable";
  factors: string[];
}

export const visitorPredictionService = {
  async getPrediction(userId?: string): Promise<VisitorPredictionData> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const currentHour = today.getHours();
      const effectiveUserId = userId || auth.currentUser?.uid;

      console.log('🔮 Iniciando predicción de visitantes...', { dayOfWeek, currentHour, effectiveUserId });

      // Get store profile for location
      let lat = -37.8136; // Melbourne fallback
      let lon = 144.9631;
      let storeName = "Local";

      if (effectiveUserId) {
        const profile = await storeProfileService.getStoreProfile(effectiveUserId);
        if (profile) {
          storeName = profile.name;
          if (profile.latitude && profile.longitude) {
            lat = profile.latitude;
            lon = profile.longitude;
          }
        }
      }

      // Get historical orders for the last 60 days
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      let orders: any[] = [];
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('created_at', '>=', sixtyDaysAgo.toISOString()),
          orderBy('created_at', 'desc')
        );
        const snapshot = await getDocs(q);
        orders = snapshot.docs.map(d => d.data());
      } catch (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Get upcoming events
      let events: any[] = [];
      try {
        const eventsRef = collection(db, 'events_calendar');
        const qEvents = query(
          eventsRef,
          where('event_date', '>=', today.toISOString().split('T')[0]),
          where('event_date', '<=', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          orderBy('event_date', 'asc')
        );
        const eventSnapshot = await getDocs(qEvents);
        events = eventSnapshot.docs.map(d => d.data());
      } catch (e) {
        console.warn("Error fetching events", e);
      }

      // Fetch REAL weather data
      let weatherData: WeatherData | null = null;
      try {
        weatherData = await weatherService.fetchWeather(lat, lon);
        console.log(`🌤️ Datos del clima real para ${storeName}:`, weatherData?.temperature);
      } catch (weatherError) {
        console.warn('Weather data unavailable:', weatherError);
      }

      // Calculate base statistics from historical data
      const ordersToday = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        return orderDate.toDateString() === today.toDateString();
      }) || [];

      // Group orders by day of week
      const ordersByDayOfWeek = orders?.reduce((acc, order) => {
        const orderDate = new Date(order.created_at!);
        const orderDay = orderDate.getDay();
        if (!acc[orderDay]) acc[orderDay] = [];
        acc[orderDay].push(order);
        return acc;
      }, {} as Record<number, any[]>) || {};

      const sameDayOrders = ordersByDayOfWeek[dayOfWeek] || [];
      const weeksOfData = orders && orders.length > 0 ? Math.max(1, Math.floor(orders.length / 7)) : 1;
      const avgVisitorsForDay = Math.round(sameDayOrders.length / weeksOfData) || 0;

      const baselinePrediction = avgVisitorsForDay > 0 ? avgVisitorsForDay : (dayOfWeek === 0 || dayOfWeek === 6 ? 45 : 35);

      // Find peak hour
      const ordersByHour = orders?.reduce((acc, order) => {
        const orderDate = new Date(order.created_at!);
        const hour = orderDate.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      const peakHourNum = Object.entries(ordersByHour)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 19;

      const peakHour = `${peakHourNum}:00`;

      // Trend calculation
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

      let expectedVisitors = baselinePrediction;
      let confidenceScore = orders && orders.length > 20 ? 65 : 50;
      const factors: string[] = [];

      // Add historical reliability factor
      if (avgVisitorsForDay > 0) {
        factors.push(`Patrón histórico (${avgVisitorsForDay} avg)`);
      }

      // Weather impact analysis
      if (weatherData) {
        const currentTemp = weatherData.temperature;
        const condition = weatherData.condition.toLowerCase();

        if (currentTemp >= 15 && currentTemp <= 25) {
          expectedVisitors *= 1.15;
          factors.push(`Clima óptimo (${currentTemp}°C)`);
          confidenceScore += 10;
        } else if (currentTemp < 12) {
          expectedVisitors *= 0.85;
          factors.push(`Frio (${currentTemp}°C)`);
        } else if (currentTemp > 28) {
          expectedVisitors *= 0.90;
          factors.push(`Calor (${currentTemp}°C)`);
        }

        if (condition.includes('rain') || condition.includes('storm')) {
          expectedVisitors *= 0.75;
          factors.push("Lluvia prevista");
          confidenceScore += 8;
        } else if (condition.includes('clear') || condition.includes('sunny')) {
          expectedVisitors *= 1.10;
          factors.push("Día despejado");
        }
      }

      // Day of week
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        expectedVisitors *= 1.25;
        factors.push("Fin de semana");
      } else if (dayOfWeek === 5) {
        expectedVisitors *= 1.15;
        factors.push("Viernes");
      }

      // Events
      const todayEvents = events?.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate.toDateString() === today.toDateString();
      }) || [];

      if (todayEvents.length > 0) {
        factors.push(`Evento: ${todayEvents[0].event_name}`);
        expectedVisitors *= (todayEvents[0].impact_level === 'high' ? 1.4 : 1.2);
        confidenceScore += 15;
      }

      // Add real-time boost
      if (ordersToday.length > 0) {
        const completionRate = currentHour / 24;
        const projectedFromToday = ordersToday.length / (completionRate || 0.1);
        expectedVisitors = (expectedVisitors * 0.6) + (projectedFromToday * 0.4);
        factors.push("Ritmo de ventas hoy");
        confidenceScore += 10;
      }

      confidenceScore = Math.min(95, Math.max(50, confidenceScore));
      const finalPrediction = Math.max(Math.round(expectedVisitors), ordersToday.length + 2);

      return {
        expectedVisitors: finalPrediction,
        confidence: Math.round(confidenceScore),
        peakHour,
        trend,
        factors: factors.slice(0, 5)
      };
    } catch (error) {
      console.error('❌ Error en predicción:', error);
      return {
        expectedVisitors: 40,
        confidence: 45,
        peakHour: "19:00",
        trend: "stable",
        factors: ["Fallo de datos", "Cálculo estimado"]
      };
    }
  }
};
