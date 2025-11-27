import { supabase } from "@/integrations/supabase/client";

export interface VisitorPredictionData {
  expectedVisitors: number;
  confidence: number;
  peakHour: string;
  trend: "up" | "down" | "stable";
  factors: string[];
}

export const visitorPredictionService = {
  async getPrediction(): Promise<VisitorPredictionData> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const currentHour = today.getHours();
      
      // Get historical orders for the last 30 days
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate statistics from real data
      const ordersToday = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        return orderDate.toDateString() === today.toDateString();
      }) || [];

      // Group orders by day of week for pattern analysis
      const ordersByDayOfWeek = orders?.reduce((acc, order) => {
        const orderDate = new Date(order.created_at!);
        const orderDay = orderDate.getDay();
        if (!acc[orderDay]) acc[orderDay] = [];
        acc[orderDay].push(order);
        return acc;
      }, {} as Record<number, any[]>) || {};

      // Calculate average visitors for current day of week
      const sameDayOrders = ordersByDayOfWeek[dayOfWeek] || [];
      const avgVisitorsForDay = Math.round(sameDayOrders.length / 4) || 0; // Divided by 4 weeks

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

      // Calculate trend based on last week vs previous week
      const lastWeek = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7;
      }).length || 0;

      const previousWeek = orders?.filter(order => {
        const orderDate = new Date(order.created_at!);
        const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo > 7 && daysAgo <= 14;
      }).length || 0;

      let trend: "up" | "down" | "stable" = "stable";
      if (lastWeek > previousWeek * 1.1) trend = "up";
      else if (lastWeek < previousWeek * 0.9) trend = "down";

      // Calculate confidence based on data availability
      const dataPoints = orders?.length || 0;
      const confidence = Math.min(95, Math.max(50, 50 + (dataPoints / 10)));

      // Determine factors
      const factors: string[] = [];
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        factors.push("Fin de semana");
      } else {
        factors.push("Día laboral");
      }
      
      if (trend === "up") {
        factors.push("Tendencia creciente");
      } else if (trend === "down") {
        factors.push("Tendencia decreciente");
      }
      
      if (currentHour >= 18 && currentHour <= 21) {
        factors.push("Hora pico");
      } else if (currentHour >= 12 && currentHour <= 14) {
        factors.push("Hora de almuerzo");
      } else {
        factors.push("Horario normal");
      }

      // Adjust expected visitors based on time of day
      let expectedVisitors = avgVisitorsForDay;
      
      // Add boost for current orders today
      expectedVisitors += ordersToday.length;
      
      // Ensure minimum value
      expectedVisitors = Math.max(expectedVisitors, ordersToday.length || 5);

      return {
        expectedVisitors,
        confidence: Math.round(confidence),
        peakHour,
        trend,
        factors
      };
    } catch (error) {
      console.error('Error calculating visitor prediction:', error);
      
      // Return fallback data if error occurs
      return {
        expectedVisitors: 0,
        confidence: 0,
        peakHour: "19:00",
        trend: "stable",
        factors: ["Sin datos suficientes"]
      };
    }
  }
};
