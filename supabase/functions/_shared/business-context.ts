// Context Aggregation for Aladdin AI
// Fetches relevant business context to provide to the LLM

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface BusinessContext {
    inventory: {
        total_items: number
        total_value: number
        low_stock_items: number
        expiring_soon_count: number
        critical_items: Array<{
            name: string
            stock: number
            days_to_expiry?: number
            risk_score?: number
        }>
    }
    sales: {
        today: number
        this_week: number
        this_month: number
        top_products: Array<{ name: string; quantity: number }>
    }
    donations: {
        total_this_month: number
        quota_percentage: number
        pending_pickups: number
        top_ngos: Array<{ ngo: string; count: number }>
    }
    legal: {
        compliance_score: number
        missing_documents: number
        next_deadline?: string
    }
    alerts: Array<{
        type: string
        message: string
        created_at: string
    }>
    forecasts: {
        next_week_demand: number
        trend: 'up' | 'down' | 'stable'
        top_predicted_products: Array<{ name: string; predicted_qty: number }>
    }
}

/**
 * Fetch comprehensive business context for AI assistant
 */
export async function fetchBusinessContext(
    supabase: SupabaseClient,
    userId: string
): Promise<BusinessContext> {
    const context: BusinessContext = {
        inventory: {
            total_items: 0,
            total_value: 0,
            low_stock_items: 0,
            expiring_soon_count: 0,
            critical_items: [],
        },
        sales: {
            today: 0,
            this_week: 0,
            this_month: 0,
            top_products: [],
        },
        donations: {
            total_this_month: 0,
            quota_percentage: 0,
            pending_pickups: 0,
            top_ngos: [],
        },
        legal: {
            compliance_score: 75,
            missing_documents: 0,
        },
        alerts: [],
        forecasts: {
            next_week_demand: 0,
            trend: 'stable',
            top_predicted_products: []
        }
    }

    try {
        // ... (existing inventory fetch code) ...
        const { data: inventory } = await supabase
            .from('inventory')
            .select('*, products(*)')
            .eq('tenant_id', userId)

        if (inventory) {
            // ... (existing inventory logic) ...
            context.inventory.total_items = inventory.reduce(
                (sum, item) => sum + (item.current_stock || 0),
                0
            )
            context.inventory.total_value = inventory.reduce(
                (sum, item) => sum + (item.current_stock || 0) * (item.products?.price || 0),
                0
            )
            context.inventory.low_stock_items = inventory.filter(
                (item) => item.current_stock < item.min_stock
            ).length

            const threeDaysFromNow = new Date()
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

            const expiringItems = inventory.filter(
                (item) =>
                    item.products?.expiration_date &&
                    new Date(item.products.expiration_date) <= threeDaysFromNow &&
                    new Date(item.products.expiration_date) > new Date()
            )

            context.inventory.expiring_soon_count = expiringItems.length
            context.inventory.critical_items = expiringItems.slice(0, 5).map((item) => ({
                name: item.products?.name || 'Unknown',
                stock: item.current_stock || 0,
                days_to_expiry: Math.ceil(
                    (new Date(item.products.expiration_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                risk_score: 0.8,
            }))
        }

        // ... (existing sales fetch code) ...
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 30)

        const { data: salesToday } = await supabase
            .from('sales')
            .select('total_price')
            .eq('tenant_id', userId)
            .gte('sale_date', today)

        context.sales.today = salesToday?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0

        const { data: salesWeek } = await supabase
            .from('sales')
            .select('total_price')
            .eq('tenant_id', userId)
            .gte('sale_date', weekAgo.toISOString())

        context.sales.this_week = salesWeek?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0

        const { data: salesMonth } = await supabase
            .from('sales')
            .select('total_price, product_id')
            .eq('tenant_id', userId)
            .gte('sale_date', monthAgo.toISOString())

        context.sales.this_month = salesMonth?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0

        const productCounts: Record<string, number> = {}
        salesMonth?.forEach((sale) => {
            if (sale.product_id) {
                productCounts[sale.product_id] = (productCounts[sale.product_id] || 0) + 1
            }
        })

        const topProductIds = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        if (topProductIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, name')
                .in('id', topProductIds)

            context.sales.top_products =
                products?.map((p) => ({
                    name: p.name,
                    quantity: productCounts[p.id],
                })) || []
        }

        // ... (existing donations fetch code) ...
        const { data: donationsMonth } = await supabase
            .from('donations')
            .select('quantity, ngo, status')
            .eq('tenant_id', userId)
            .gte('created_at', monthAgo.toISOString())

        context.donations.total_this_month =
            donationsMonth?.reduce((sum, d) => sum + (d.quantity || 0), 0) || 0
        context.donations.pending_pickups =
            donationsMonth?.filter((d) => d.status === 'pending').length || 0

        const totalSurplus = context.inventory.expiring_soon_count
        const requiredDonations = totalSurplus * 0.2
        context.donations.quota_percentage =
            requiredDonations > 0
                ? Math.round((context.donations.total_this_month / requiredDonations) * 100)
                : 100

        const ngoCount: Record<string, number> = {}
        donationsMonth?.forEach((d) => {
            if (d.ngo) {
                ngoCount[d.ngo] = (ngoCount[d.ngo] || 0) + 1
            }
        })

        context.donations.top_ngos = Object.entries(ngoCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([ngo, count]) => ({ ngo, count }))

        // ... (existing legal fetch code) ...
        const { data: legalDocs } = await supabase
            .from('legal_documents')
            .select('status')
            .eq('tenant_id', userId)

        context.legal.missing_documents =
            legalDocs?.filter((d) => d.status === 'generating' || d.status === 'failed').length || 0

        // Fetch Forecasts (NEW)
        try {
            const nextWeek = new Date()
            nextWeek.setDate(nextWeek.getDate() + 7)

            const { data: forecasts } = await supabase
                .from('demand_forecasts')
                .select('predicted_demand, product_id, products(name)')
                .gte('forecast_date', new Date().toISOString())
                .lte('forecast_date', nextWeek.toISOString())
                .eq('scenario', 'base')

            if (forecasts && forecasts.length > 0) {
                const totalDemand = forecasts.reduce((sum, f) => sum + (f.predicted_demand || 0), 0)
                context.forecasts.next_week_demand = totalDemand

                // Determine trend (simplified: compare next week forecast vs last week sales)
                const lastWeekSales = context.sales.this_week
                if (totalDemand > lastWeekSales * 1.1) context.forecasts.trend = 'up'
                else if (totalDemand < lastWeekSales * 0.9) context.forecasts.trend = 'down'
                else context.forecasts.trend = 'stable'

                // Top predicted products
                const productDemand: Record<string, { name: string, qty: number }> = {}
                forecasts.forEach(f => {
                    const name = f.products?.name || 'Unknown'
                    if (!productDemand[name]) productDemand[name] = { name, qty: 0 }
                    productDemand[name].qty += f.predicted_demand
                })

                context.forecasts.top_predicted_products = Object.values(productDemand)
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 3)
            }
        } catch (err) {
            console.error('[Context] Error fetching forecasts:', err)
        }

    } catch (error) {
        console.error('[Context] Error fetching business context:', error)
    }

    return context
}

/**
 * Convert business context to natural language for LLM
 */
export function contextToText(context: BusinessContext): string {
    return `
# Business Context

## Inventory Overview
- Total items in stock: ${context.inventory.total_items}
- Total inventory value: €${context.inventory.total_value.toFixed(2)}
- Low stock items: ${context.inventory.low_stock_items}
- Items expiring soon (within 3 days): ${context.inventory.expiring_soon_count}

${context.inventory.critical_items.length > 0
            ? `### Critical Items (High Risk):
${context.inventory.critical_items
                .map(
                    (item) =>
                        `- **${item.name}**: ${item.stock} units, expires in ${item.days_to_expiry} days (Risk: ${(
                            item.risk_score! * 100
                        ).toFixed(0)}%)`
                )
                .join('\n')}`
            : ''
        }

## Sales Performance
- Sales today: €${context.sales.today.toFixed(2)}
- Sales this week: €${context.sales.this_week.toFixed(2)}
- Sales this month: €${context.sales.this_month.toFixed(2)}

${context.sales.top_products.length > 0
            ? `### Top Selling Products:
${context.sales.top_products.map((p) => `- ${p.name}: ${p.quantity} units`).join('\n')}`
            : ''
        }

## AI Demand Forecast (Prophet Model)
- Projected demand next 7 days: ${context.forecasts.next_week_demand.toFixed(0)} units
- Trend: ${context.forecasts.trend.toUpperCase()} (vs last week)

${context.forecasts.top_predicted_products.length > 0
            ? `### Top Predicted Demand (Next 7 Days):
${context.forecasts.top_predicted_products.map((p) => `- ${p.name}: ${p.predicted_qty.toFixed(0)} units`).join('\n')}`
            : ''
        }

## Donations & Compliance
- Donations this month: ${context.donations.total_this_month} items
- Donation quota met: ${context.donations.quota_percentage}% (Law requires 20% of surplus)
- Pending pickups: ${context.donations.pending_pickups}

${context.donations.top_ngos.length > 0
            ? `### Partner NGOs:
${context.donations.top_ngos.map((ngo) => `- ${ngo.ngo}: ${ngo.count} donations`).join('\n')}`
            : ''
        }

## Legal Compliance
- Compliance score: ${context.legal.compliance_score}/100
- Missing/incomplete documents: ${context.legal.missing_documents}

${context.alerts.length > 0
            ? `## Active Alerts
${context.alerts.map((a) => `- [${a.type}] ${a.message}`).join('\n')}`
            : ''
        }
`.trim()
}
