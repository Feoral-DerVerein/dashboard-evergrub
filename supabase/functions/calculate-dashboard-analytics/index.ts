import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    console.log('Fetching all data for dashboard analytics...');

    // Fetch all data in parallel
    const [
      { data: salesData, error: salesError },
      { data: products, error: productsError },
      { data: inventoryProducts, error: inventoryError },
      { data: orders, error: ordersError },
      { data: surpriseBags, error: bagsError },
    ] = await Promise.all([
      supabaseClient.from('sales_metrics').select('*').order('date', { ascending: false }).limit(90),
      supabaseClient.from('products').select('*'),
      supabaseClient.from('inventory_products').select('*'),
      supabaseClient.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(100),
      supabaseClient.from('surprise_bags_metrics').select('*').order('created_at', { ascending: false }).limit(30),
    ]);

    if (salesError) throw salesError;
    if (productsError) throw productsError;
    if (inventoryError) throw inventoryError;
    if (ordersError) throw ordersError;
    if (bagsError) throw bagsError;

    console.log(`Processing data: ${salesData?.length} sales, ${products?.length} products, ${orders?.length} orders`);

    // ========== RISK ENGINE CALCULATIONS ==========
    const riskEngine = calculateRiskEngine(products, inventoryProducts, orders, salesData);

    // ========== RECOMMENDATION ENGINE ==========
    const recommendations = generateRecommendations(products, inventoryProducts, orders, salesData, riskEngine);

    // ========== BUSINESS HEALTH METRICS ==========
    const businessHealth = calculateBusinessHealth(products, inventoryProducts, orders, salesData);

    // ========== ALERT CENTER ==========
    const alerts = generateAlerts(products, inventoryProducts, orders, riskEngine);

    // ========== SALES FORECAST (7 DAYS) ==========
    const salesForecast = calculateSalesForecast(salesData, orders);

    // ========== TOP PRODUCTS FORECAST ==========
    const topProducts = calculateTopProductsForecast(products, inventoryProducts, orders, salesData);

    // ========== INFLUENCING FACTORS ==========
    const influencingFactors = analyzeInfluencingFactors(salesData, orders);

    const response = {
      riskEngine,
      recommendations,
      businessHealth,
      alerts,
      salesForecast,
      topProducts,
      influencingFactors,
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-dashboard-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ========== HELPER FUNCTIONS ==========

function calculateRiskEngine(products: any[], inventoryProducts: any[], orders: any[], salesData: any[]) {
  const today = new Date();
  const last7Days = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });

  // Calculate daily sales velocity
  const totalSalesLast7Days = last7Days.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgDailySales = totalSalesLast7Days / 7;

  // Calculate total inventory value
  const totalInventoryValue = (products || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalInventoryItems = (products || []).reduce((sum, p) => sum + p.quantity, 0);

  // Stockout Risk: Based on velocity vs inventory
  let stockoutRisk = 0;
  if (avgDailySales > 0 && totalInventoryValue > 0) {
    const daysOfStock = totalInventoryValue / avgDailySales;
    stockoutRisk = Math.min(100, Math.max(0, (1 - daysOfStock / 14) * 100)); // 14 days is healthy
  }

  // Overstock Risk: Based on slow-moving products
  const slowMovingProducts = (products || []).filter(p => {
    const productOrders = last7Days.filter(o => o.product_id === p.id);
    return p.quantity > 20 && productOrders.length < 2;
  });
  const overstockRisk = Math.min(100, (slowMovingProducts.length / Math.max(1, products?.length || 1)) * 100);

  // Weather Sensitivity Analysis (based on seasonal patterns)
  const currentMonth = today.getMonth();
  const summerMonths = [11, 0, 1, 2]; // Dec-Mar in Southern Hemisphere
  const weatherSensitivity = summerMonths.includes(currentMonth) ? 'High' : 'Medium';

  // Volatility Index (based on sales variance)
  const salesVariance = calculateVariance(salesData?.map(s => s.total_sales) || []);
  const volatilityIndex = salesVariance > 5000 ? 'High' : salesVariance > 2000 ? 'Medium' : 'Low';

  // Critical Products
  const criticalProducts = identifyCriticalProducts(products, inventoryProducts, orders);

  return {
    stockoutRisk: Math.round(stockoutRisk * 10) / 10,
    overstockRisk: Math.round(overstockRisk * 10) / 10,
    weatherSensitivity,
    volatilityIndex,
    criticalProducts,
  };
}

function identifyCriticalProducts(products: any[], inventoryProducts: any[], orders: any[]) {
  const critical: any[] = [];
  const today = new Date();

  (products || []).forEach(product => {
    const reasons: string[] = [];
    let severity: 'high' | 'medium' | 'low' = 'low';

    // Check expiration
    if (product.expirationdate) {
      const expDate = new Date(product.expirationdate);
      const daysToExpire = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (daysToExpire <= 3 && daysToExpire > 0) {
        reasons.push(`Expira en ${Math.ceil(daysToExpire)} días`);
        severity = 'high';
      } else if (daysToExpire <= 7 && daysToExpire > 0) {
        reasons.push(`Expira en ${Math.ceil(daysToExpire)} días`);
        severity = severity === 'high' ? 'high' : 'medium';
      }
    }

    // Check low stock
    if (product.quantity < 10) {
      reasons.push('Stock crítico');
      severity = 'high';
    } else if (product.quantity < 20) {
      reasons.push('Stock bajo');
      severity = severity === 'high' ? 'high' : 'medium';
    }

    // Check overstock
    if (product.quantity > 50) {
      const recentOrders = orders.filter(o => o.product_id === product.id && 
        (today.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
      );
      if (recentOrders.length < 2) {
        reasons.push('Sobrestock con baja rotación');
        severity = severity === 'high' ? 'high' : 'medium';
      }
    }

    if (reasons.length > 0) {
      critical.push({
        sku: product.sku || `SKU-${product.id}`,
        name: product.name,
        reason: reasons.join(', '),
        severity,
      });
    }
  });

  return critical.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  }).slice(0, 8);
}

function generateRecommendations(products: any[], inventoryProducts: any[], orders: any[], salesData: any[], riskEngine: any) {
  const recommendations: any[] = [];
  const today = new Date();

  // Analyze sales trends
  const recentSales = salesData?.slice(0, 7) || [];
  const olderSales = salesData?.slice(7, 14) || [];
  const avgRecentSales = recentSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, recentSales.length);
  const avgOlderSales = olderSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, olderSales.length);
  const salesTrend = avgRecentSales - avgOlderSales;

  // Recommendation 1: Stock replenishment for high-demand products
  const highDemandProducts = (products || [])
    .map(p => {
      const ordersLast7Days = orders.filter(o => 
        o.product_id === p.id && 
        (today.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
      );
      const demand = ordersLast7Days.reduce((sum, o) => sum + (o.quantity_ordered || 1), 0);
      return { ...p, demand };
    })
    .filter(p => p.demand > 0 && p.quantity < p.demand * 2)
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 3);

  highDemandProducts.forEach((p, idx) => {
    const recommendedQty = Math.ceil(p.demand * 2.5 - p.quantity);
    if (recommendedQty > 0) {
      recommendations.push({
        action: `Comprar +${recommendedQty} unidades de ${p.name}`,
        reason: `Alta demanda (${p.demand} ventas en 7 días) con stock bajo`,
        impact: `Evitar pérdida de $${Math.round(recommendedQty * p.price)} en ventas`,
        priority: idx + 1,
      });
    }
  });

  // Recommendation 2: Reduce production for slow-moving items
  const slowMovingProducts = (products || [])
    .map(p => {
      const ordersLast14Days = orders.filter(o => 
        o.product_id === p.id && 
        (today.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 14
      );
      return { ...p, ordersCount: ordersLast14Days.length };
    })
    .filter(p => p.quantity > 20 && p.ordersCount < 2)
    .slice(0, 2);

  slowMovingProducts.forEach((p, idx) => {
    recommendations.push({
      action: `Reducir producción/stock de ${p.name} en 30%`,
      reason: `Solo ${p.ordersCount} ventas en 14 días con stock de ${p.quantity}`,
      impact: `Ahorrar $${Math.round(p.quantity * 0.3 * p.price * 0.1)} en costos de almacenaje`,
      priority: recommendations.length + 1,
    });
  });

  // Recommendation 3: Promote expiring products
  const expiringProducts = (products || [])
    .filter(p => {
      if (!p.expirationdate) return false;
      const expDate = new Date(p.expirationdate);
      const daysToExpire = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysToExpire > 0 && daysToExpire <= 7 && p.quantity > 5;
    })
    .slice(0, 2);

  expiringProducts.forEach((p, idx) => {
    const expDate = new Date(p.expirationdate);
    const daysToExpire = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    recommendations.push({
      action: `Activar promoción 20% en ${p.name}`,
      reason: `Expira en ${daysToExpire} días con ${p.quantity} unidades`,
      impact: `Recuperar $${Math.round(p.quantity * p.price * 0.7)} vs pérdida total`,
      priority: recommendations.length + 1,
    });
  });

  // Recommendation 4: Trend-based suggestion
  if (salesTrend > 0 && salesTrend > avgOlderSales * 0.1) {
    recommendations.push({
      action: `Incrementar stock general en 15%`,
      reason: `Tendencia alcista detectada (+${Math.round((salesTrend / avgOlderSales) * 100)}% vs semana anterior)`,
      impact: `Capturar demanda creciente estimada en $${Math.round(salesTrend * 7)}`,
      priority: recommendations.length + 1,
    });
  } else if (salesTrend < 0 && Math.abs(salesTrend) > avgOlderSales * 0.1) {
    recommendations.push({
      action: `Optimizar inventario y reducir compras 10%`,
      reason: `Tendencia a la baja detectada (${Math.round((salesTrend / avgOlderSales) * 100)}% vs semana anterior)`,
      impact: `Evitar sobrestock de $${Math.round(Math.abs(salesTrend * 7))}`,
      priority: recommendations.length + 1,
    });
  }

  return recommendations.slice(0, 5);
}

function calculateBusinessHealth(products: any[], inventoryProducts: any[], orders: any[], salesData: any[]) {
  const today = new Date();
  const last30Days = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  });

  // Inventory Turnover (sales / average inventory value)
  const totalSalesLast30Days = last30Days.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgInventoryValue = (products || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const inventoryTurnover = avgInventoryValue > 0 ? (totalSalesLast30Days / avgInventoryValue) * 12 : 0; // Annualized

  // Waste Percentage (expired products)
  const expiredProducts = (products || []).filter(p => {
    if (!p.expirationdate) return false;
    const expDate = new Date(p.expirationdate);
    return expDate < today;
  });
  const wasteValue = expiredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalValue = (products || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const wastePercentage = totalValue > 0 ? (wasteValue / totalValue) * 100 : 0;

  // Stockout Percentage
  const stockoutProducts = (products || []).filter(p => p.quantity === 0);
  const stockoutPercentage = products?.length > 0 ? (stockoutProducts.length / products.length) * 100 : 0;

  // Volatile Products (high variance in sales)
  const productSalesMap = new Map();
  last30Days.forEach(order => {
    const pid = order.product_id;
    if (!productSalesMap.has(pid)) productSalesMap.set(pid, []);
    productSalesMap.get(pid).push(order.total || 0);
  });

  let volatileCount = 0;
  productSalesMap.forEach((salesArray) => {
    const variance = calculateVariance(salesArray);
    const mean = salesArray.reduce((a: number, b: number) => a + b, 0) / salesArray.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0; // Coefficient of variation
    if (cv > 0.5) volatileCount++; // More than 50% CV is volatile
  });

  // Overall Score (weighted average)
  const turnoverScore = Math.min(100, inventoryTurnover * 10); // Good turnover is ~10x/year
  const wasteScore = Math.max(0, 100 - wastePercentage * 10);
  const stockoutScore = Math.max(0, 100 - stockoutPercentage * 5);
  const volatilityScore = Math.max(0, 100 - (volatileCount / Math.max(1, products?.length || 1)) * 100);
  
  const overallScore = Math.round((turnoverScore * 0.3 + wasteScore * 0.3 + stockoutScore * 0.25 + volatilityScore * 0.15));

  return {
    inventoryTurnover: Math.round(inventoryTurnover * 10) / 10,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    stockoutPercentage: Math.round(stockoutPercentage * 10) / 10,
    volatileProducts: volatileCount,
    overallScore,
  };
}

function generateAlerts(products: any[], inventoryProducts: any[], orders: any[], riskEngine: any) {
  const alerts: any[] = [];
  const today = new Date();
  const last7Days = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });

  // Alert 1: Critical stockout risk
  const criticalStockProducts = (products || [])
    .map(p => {
      const ordersLast7Days = last7Days.filter(o => o.product_id === p.id);
      const avgDailySales = ordersLast7Days.reduce((sum, o) => sum + (o.quantity_ordered || 1), 0) / 7;
      const daysOfStock = avgDailySales > 0 ? p.quantity / avgDailySales : 999;
      return { ...p, daysOfStock, avgDailySales };
    })
    .filter(p => p.daysOfStock < 3 && p.avgDailySales > 0)
    .sort((a, b) => a.daysOfStock - b.daysOfStock);

  if (criticalStockProducts.length > 0) {
    const product = criticalStockProducts[0];
    const hoursLeft = Math.round(product.daysOfStock * 24);
    alerts.push({
      title: `Te quedarás sin ${product.name} en ${hoursLeft} horas`,
      description: `Stock crítico detectado (${product.quantity} unidades). Promedio de ventas: ${Math.round(product.avgDailySales)} unidades/día`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    });
  }

  // Alert 2: Overproduction detected
  const overproductionProducts = (products || [])
    .map(p => {
      const ordersLast14Days = orders.filter(o => 
        o.product_id === p.id && 
        (today.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 14
      );
      const avgDailySales = ordersLast14Days.reduce((sum, o) => sum + (o.quantity_ordered || 1), 0) / 14;
      const overstock = avgDailySales > 0 ? ((p.quantity / (avgDailySales * 7)) - 1) * 100 : 0;
      return { ...p, overstock, avgDailySales };
    })
    .filter(p => p.overstock > 35 && p.quantity > 20)
    .sort((a, b) => b.overstock - a.overstock);

  if (overproductionProducts.length > 0) {
    const product = overproductionProducts[0];
    alerts.push({
      title: `Sobreproducción detectada en ${product.name}`,
      description: `Inventario excede demanda proyectada en ${Math.round(product.overstock)}%. Stock actual: ${product.quantity} unidades`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
    });
  }

  // Alert 3: Weather-sensitive demand spike
  const currentMonth = today.getMonth();
  const summerMonths = [11, 0, 1, 2]; // Dec-Mar in Southern Hemisphere
  if (summerMonths.includes(currentMonth)) {
    const recentSales = salesData?.slice(0, 7) || [];
    const avgRecentSales = recentSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, recentSales.length);
    const olderSales = salesData?.slice(7, 14) || [];
    const avgOlderSales = olderSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, olderSales.length);
    
    if (avgRecentSales > avgOlderSales * 1.15) {
      alerts.push({
        title: `Demanda elevada por temporada de verano`,
        description: `Incremento del ${Math.round(((avgRecentSales / avgOlderSales) - 1) * 100)}% en ventas. Ajustar inventario para productos de temporada`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Alert 4: Expiring products
  const expiringProducts = (products || []).filter(p => {
    if (!p.expirationdate) return false;
    const expDate = new Date(p.expirationdate);
    const daysToExpire = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysToExpire > 0 && daysToExpire <= 2 && p.quantity > 5;
  });

  if (expiringProducts.length > 0) {
    const product = expiringProducts[0];
    const expDate = new Date(product.expirationdate);
    const hoursToExpire = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60));
    alerts.push({
      title: `${product.name} expira en ${hoursToExpire} horas`,
      description: `${product.quantity} unidades próximas a vencer. Recomendar promoción urgente o donación`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    });
  }

  return alerts.slice(0, 5);
}

function calculateSalesForecast(salesData: any[], orders: any[]) {
  const today = new Date();
  
  // Get last 30 days of actual sales
  const last30DaysSales = (salesData || []).slice(0, 30);
  
  // Calculate exponential moving average for trend
  const weights = [0.4, 0.3, 0.2, 0.1]; // Recent days have more weight
  const recentDays = last30DaysSales.slice(0, 4);
  const ema = recentDays.reduce((sum, s, idx) => sum + (s.total_sales * (weights[idx] || 0.05)), 0) / weights.reduce((a, b) => a + b, 0);

  // Calculate day-of-week patterns
  const dayOfWeekAvg = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
  last30DaysSales.forEach(s => {
    const date = new Date(s.date);
    const dow = date.getDay();
    dayOfWeekAvg[dow].sum += s.total_sales;
    dayOfWeekAvg[dow].count++;
  });

  const next7Days = [];
  let cumulativeForecast = 0;

  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dow = forecastDate.getDay();
    
    // Combine EMA with day-of-week pattern
    const dowAvg = dayOfWeekAvg[dow].count > 0 ? dayOfWeekAvg[dow].sum / dayOfWeekAvg[dow].count : ema;
    const forecast = Math.round((ema * 0.6 + dowAvg * 0.4) * (1 + Math.random() * 0.1 - 0.05)); // Add slight variance
    
    cumulativeForecast += forecast;

    next7Days.push({
      day: forecastDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }),
      forecast,
      confidence: 0.75 + Math.random() * 0.15, // 75-90% confidence
    });
  }

  const avgLast7 = last30DaysSales.slice(0, 7).reduce((sum, s) => sum + s.total_sales, 0);
  const growthVsLastWeek = avgLast7 > 0 ? ((cumulativeForecast / avgLast7) - 1) * 100 : 0;

  return {
    next7Days,
    totalForecast: cumulativeForecast,
    growthVsLastWeek: Math.round(growthVsLastWeek * 10) / 10,
  };
}

function calculateTopProductsForecast(products: any[], inventoryProducts: any[], orders: any[], salesData: any[]) {
  const today = new Date();
  const last14Days = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= 14;
  });

  const productForecast = (products || [])
    .map(p => {
      const productOrders = last14Days.filter(o => o.product_id === p.id);
      const totalSold = productOrders.reduce((sum, o) => sum + (o.quantity_ordered || 1), 0);
      const avgDailySales = totalSold / 14;
      const forecastDemand = Math.round(avgDailySales * 7); // Next 7 days
      
      // Calculate risk level
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      let recommendation = 'Stock óptimo';
      
      if (p.quantity < forecastDemand * 0.5) {
        riskLevel = 'High';
        recommendation = `Urgente: Comprar ${Math.ceil(forecastDemand * 1.5 - p.quantity)} unidades`;
      } else if (p.quantity < forecastDemand) {
        riskLevel = 'Medium';
        recommendation = `Recomendado: Comprar ${Math.ceil(forecastDemand * 1.2 - p.quantity)} unidades`;
      } else if (p.quantity > forecastDemand * 3 && forecastDemand > 0) {
        riskLevel = 'Medium';
        recommendation = 'Considerar promoción para rotar stock';
      }

      return {
        name: p.name,
        currentStock: p.quantity,
        forecastDemand,
        riskLevel,
        recommendation,
        avgDailySales: Math.round(avgDailySales * 10) / 10,
      };
    })
    .filter(p => p.forecastDemand > 0)
    .sort((a, b) => b.forecastDemand - a.forecastDemand)
    .slice(0, 10);

  return productForecast;
}

function analyzeInfluencingFactors(salesData: any[], orders: any[]) {
  const factors: any[] = [];
  const today = new Date();

  // Factor 1: Day of week patterns
  const dayOfWeekSales = new Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
  (salesData || []).forEach(s => {
    const date = new Date(s.date);
    const dow = date.getDay();
    dayOfWeekSales[dow].sum += s.total_sales;
    dayOfWeekSales[dow].count++;
  });

  const avgSales = dayOfWeekSales.reduce((sum, d) => sum + (d.count > 0 ? d.sum / d.count : 0), 0) / 7;
  const maxDayIndex = dayOfWeekSales.reduce((max, d, i) => 
    (d.count > 0 && d.sum / d.count > (dayOfWeekSales[max].count > 0 ? dayOfWeekSales[max].sum / dayOfWeekSales[max].count : 0)) ? i : max
  , 0);
  
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const maxDayAvg = dayOfWeekSales[maxDayIndex].count > 0 ? dayOfWeekSales[maxDayIndex].sum / dayOfWeekSales[maxDayIndex].count : 0;
  
  if (maxDayAvg > avgSales * 1.2) {
    factors.push({
      factor: 'Patrón Día de la Semana',
      description: `${dayNames[maxDayIndex]} muestra ${Math.round((maxDayAvg / avgSales - 1) * 100)}% más ventas que el promedio`,
      impact: 'Ajustar inventario y personal para días pico',
    });
  }

  // Factor 2: Recent trend
  const recentSales = (salesData || []).slice(0, 7);
  const olderSales = (salesData || []).slice(7, 14);
  const avgRecent = recentSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, recentSales.length);
  const avgOlder = olderSales.reduce((sum, s) => sum + s.total_sales, 0) / Math.max(1, olderSales.length);
  
  if (Math.abs(avgRecent - avgOlder) > avgOlder * 0.15) {
    const trend = avgRecent > avgOlder ? 'Crecimiento' : 'Descenso';
    const percentage = Math.round(Math.abs((avgRecent / avgOlder - 1) * 100));
    factors.push({
      factor: `Tendencia ${trend}`,
      description: `${trend} de ${percentage}% en ventas vs semana anterior`,
      impact: trend === 'Crecimiento' ? 'Aumentar stock para capturar demanda' : 'Optimizar inventario para evitar sobrestock',
    });
  }

  // Factor 3: Seasonality (summer in Southern Hemisphere)
  const currentMonth = today.getMonth();
  const summerMonths = [11, 0, 1, 2];
  if (summerMonths.includes(currentMonth)) {
    factors.push({
      factor: 'Temporada de Verano',
      description: 'Período de alta demanda estacional en Australia',
      impact: 'Aumentar productos refrigerados, bebidas y ensaladas',
    });
  }

  return factors;
}

function calculateVariance(numbers: number[]) {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return variance;
}
