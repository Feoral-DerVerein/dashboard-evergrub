import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { validateUser } from "../_shared/auth.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user, supabase, error } = await validateUser(req)
        if (error) return error

        const url = new URL(req.url)
        const path = url.pathname.split('/').pop()

        // POST /forecasting-engine/forecast-demand
        if (req.method === 'POST' && path === 'forecast-demand') {
            const { product_id, days = 7 } = await req.json()

            const mlServiceUrl = Deno.env.get('ML_SERVICE_URL')

            // If ML service is configured, use it
            if (mlServiceUrl) {
                try {
                    // Fetch historical sales data
                    const { data: salesHistory } = await supabase
                        .from('sales')
                        .select('sale_date, quantity')
                        .eq('product_id', product_id)
                        .eq('tenant_id', user!.id)
                        .order('sale_date', { ascending: true })

                    // Transform for ML service
                    const history = salesHistory?.map(s => ({
                        date: s.sale_date.split('T')[0],
                        value: s.quantity
                    })) || []

                    // Call ML Service
                    const response = await fetch(`${mlServiceUrl}/predict/demand`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            product_id: String(product_id),
                            history,
                            days
                        })
                    })

                    if (!response.ok) throw new Error(`ML Service error: ${response.statusText}`)

                    const result = await response.json()

                    // SAVE TO DB (New Step)
                    // We need to save the forecast so Aladdin can see it later
                    if (result.forecast && Array.isArray(result.forecast)) {
                        const forecastsToUpsert = result.forecast.map((f: any) => ({
                            product_id: product_id,
                            forecast_date: f.date,
                            predicted_demand: f.predicted_demand,
                            confidence_lower: f.confidence_lower,
                            confidence_upper: f.confidence_upper,
                            scenario: 'base', // Default for now
                            model_version: 'prophet-v1'
                        }))

                        const { error: upsertError } = await supabase
                            .from('demand_forecasts')
                            .upsert(forecastsToUpsert, { onConflict: 'product_id,forecast_date,scenario' })

                        if (upsertError) console.error('Error saving forecast to DB:', upsertError)
                    }

                    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

                } catch (err) {
                    console.error('ML Service failed, falling back to mock:', err)
                    // Fallthrough to mock logic below
                }
            }

            // Fallback / Mock Logic
            const forecast = Array.from({ length: days }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i + 1)
                return {
                    date: date.toISOString().split('T')[0],
                    predicted_demand: Math.floor(Math.random() * 20) + 5, // Random 5-25
                    confidence_lower: 0,
                    confidence_upper: 0
                }
            })

            // Save Mock Data to DB as well (so Aladdin works even with mocks)
            const mockForecastsToUpsert = forecast.map((f: any) => ({
                product_id: product_id,
                forecast_date: f.date,
                predicted_demand: f.predicted_demand,
                confidence_lower: f.confidence_lower,
                confidence_upper: f.confidence_upper,
                scenario: 'base',
                model_version: 'mock-v1'
            }))

            await supabase
                .from('demand_forecasts')
                .upsert(mockForecastsToUpsert, { onConflict: 'product_id,forecast_date,scenario' })

            return new Response(JSON.stringify({ product_id, forecast, source: 'mock' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /forecasting-engine/forecast-scenario
        if (req.method === 'POST' && path === 'forecast-scenario') {
            const { product_id, days = 7, scenario = 'base', regressors = null } = await req.json()

            const mlServiceUrl = Deno.env.get('ML_SERVICE_URL')

            // If ML service is configured, use it
            if (mlServiceUrl) {
                try {
                    // Fetch historical sales data
                    const { data: salesHistory } = await supabase
                        .from('sales')
                        .select('sale_date, quantity')
                        .eq('product_id', product_id)
                        .eq('tenant_id', user!.id)
                        .order('sale_date', { ascending: true })

                    // Transform for ML service
                    const history = salesHistory?.map(s => ({
                        date: s.sale_date.split('T')[0],
                        value: s.quantity
                    })) || []

                    // Call ML Service with scenario
                    const response = await fetch(`${mlServiceUrl}/predict/scenario`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sales_history: history,
                            days_to_forecast: days,
                            scenario,
                            regressors
                        })
                    })

                    if (!response.ok) throw new Error(`ML Service error: ${response.statusText}`)

                    const result = await response.json()

                    // Save forecast to DB
                    if (result.forecast && Array.isArray(result.forecast)) {
                        const forecastsToUpsert = result.forecast.map((f: any) => ({
                            product_id: product_id,
                            forecast_date: f.date,
                            predicted_demand: f.predicted_demand,
                            confidence_lower: f.confidence_lower || 0,
                            confidence_upper: f.confidence_upper || 0,
                            scenario: scenario,
                            model_version: 'prophet-v1-scenario'
                        }))

                        await supabase
                            .from('demand_forecasts')
                            .upsert(forecastsToUpsert, { onConflict: 'product_id,forecast_date,scenario' })
                    }

                    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

                } catch (err) {
                    console.error('ML Service failed for scenario, falling back to mock:', err)
                    // Fallthrough to mock logic below
                }
            }

            // Fallback / Mock Logic
            const multiplier = scenario === 'optimistic' ? 1.25 : scenario === 'crisis' ? 0.65 : 1.0
            const forecast = Array.from({ length: days }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i + 1)
                const baseDemand = Math.floor(Math.random() * 20) + 5
                return {
                    date: date.toISOString().split('T')[0],
                    predicted_demand: Math.round(baseDemand * multiplier),
                    confidence_lower: 0,
                    confidence_upper: 0,
                    scenario
                }
            })

            return new Response(JSON.stringify({ scenario, forecast, source: 'mock' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // POST /forecasting-engine/forecast-expiration-risk
        if (req.method === 'POST' && path === 'forecast-expiration-risk') {
            // Calculate risk based on stock vs avg daily sales vs days to expiration
            const { data: products } = await supabase
                .from('products')
                .select('id, name, stock, expiration_date')
                .eq('tenant_id', user!.id)
                .not('expiration_date', 'is', null)

            const risks = products?.map(p => {
                const daysToExpiry = Math.ceil((new Date(p.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const mockAvgDailySales = 2 // Should fetch from sales history
                const daysOfStock = (p.stock || 0) / mockAvgDailySales

                let riskScore = 0
                if (daysToExpiry < 0) riskScore = 1.0 // Expired
                else if (daysOfStock > daysToExpiry) riskScore = 0.8 // High risk (won't sell in time)
                else if (daysToExpiry < 3) riskScore = 0.6 // Warning
                else riskScore = 0.1 // Low risk

                return {
                    product_id: p.id,
                    name: p.name,
                    risk_score: riskScore,
                    days_to_expiry: daysToExpiry
                }
            })

            return new Response(JSON.stringify(risks), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // GET /forecasting-engine/weather-current
        if (req.method === 'GET' && path === 'weather-current') {
            // Check cache first
            const today = new Date().toISOString().split('T')[0]
            const { data: cached } = await supabase
                .from('weather_cache')
                .select('*')
                .eq('tenant_id', user!.id)
                .eq('date', today)
                .single()

            if (cached) {
                return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            // If not cached, fetch from OpenWeatherMap
            const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
            let weatherData = null

            if (apiKey) {
                try {
                    // Default to London for demo if no location provided (in real app, get from tenant profile)
                    const lat = 51.5074
                    const lon = -0.1278

                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
                    if (response.ok) {
                        const data = await response.json()
                        weatherData = {
                            date: today,
                            temperature: data.main.temp,
                            humidity: data.main.humidity,
                            weather_code: data.weather[0].description,
                            tenant_id: user!.id
                        }
                    }
                } catch (e) {
                    console.error('Weather API error:', e)
                }
            }

            // Fallback if API fails or no key
            if (!weatherData) {
                weatherData = {
                    date: today,
                    temperature: 22.5,
                    humidity: 60,
                    weather_code: 'sunny (mock)',
                    tenant_id: user!.id
                }
            }

            // Cache it
            await supabase.from('weather_cache').insert(weatherData)

            return new Response(JSON.stringify(weatherData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
    }
})
