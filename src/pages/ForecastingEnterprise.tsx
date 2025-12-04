
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { enterpriseService } from '@/services/enterpriseService';
import { WeatherWidget } from '@/components/enterprise/WeatherWidget';
import { AlertsPanel } from '@/components/enterprise/AlertsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertOctagon, ShoppingCart, BarChart3, Store, Layers, Package, ArrowRight, Brain } from 'lucide-react';

const ForecastingEnterprise = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [forecast, setForecast] = useState<any[]>([]);
    const [risks, setRisks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState<'base' | 'optimistic' | 'crisis'>('base');
    const [granularity, setGranularity] = useState<'sku' | 'category' | 'store'>('sku');

    // Load products for selection
    useEffect(() => {
        const loadProducts = async () => {
            const data = await enterpriseService.getProducts();
            if (data && data.length > 0) {
                setProducts(data);
                setSelectedProduct(data[0].id);
            }
        };
        loadProducts();
        loadRisks();
    }, []);

    // Load forecast when product or scenario changes
    useEffect(() => {
        if (selectedProduct) {
            loadForecast(selectedProduct);
        }
    }, [selectedProduct, scenario]);

    const loadForecast = async (productId: string) => {
        setLoading(true);
        try {
            // Use the new scenario-based forecast endpoint
            const data = await enterpriseService.getScenarioForecast(productId, 30, scenario);
            if (data && data.forecast) {
                setForecast(data.forecast);
            }
        } catch (error) {
            console.error("Error loading forecast:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRisks = async () => {
        try {
            const data = await enterpriseService.getExpirationRisk();
            setRisks(data || []);
        } catch (error) {
            console.error("Error loading risks:", error);
        }
    };

    const getPrescriptions = () => {
        if (scenario === 'crisis') {
            return [
                {
                    type: 'critical',
                    title: 'Reduce Inventory',
                    description: 'Reduce inventory of yogurts by 35% immediately to avoid expiration.',
                    action: 'Create Return Order'
                },
                {
                    type: 'warning',
                    title: 'Stop Replenishment',
                    description: 'Do not replenish this product for the next 2 weeks.',
                    action: 'Pause Auto-Order'
                }
            ];
        }
        if (scenario === 'optimistic') {
            return [
                {
                    type: 'success',
                    title: 'Increase Stock',
                    description: 'Buy 18 extra units next week to meet surge demand.',
                    action: 'Add to Order'
                }
            ];
        }
        return [
            {
                type: 'info',
                title: 'Maintain Levels',
                description: 'Current stock levels are optimal for projected demand.',
                action: 'View Details'
            }
        ];
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Forecasting Engine</h1>
                    <p className="text-gray-600">Predictive & Prescriptive Analytics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Granularity Selector */}
                    <div className="bg-white p-1 rounded-lg border flex">
                        <Button
                            variant={granularity === 'store' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setGranularity('store')}
                            className="h-8"
                        >
                            <Store className="h-4 w-4 mr-2" /> Store
                        </Button>
                        <Button
                            variant={granularity === 'category' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setGranularity('category')}
                            className="h-8"
                        >
                            <Layers className="h-4 w-4 mr-2" /> Category
                        </Button>
                        <Button
                            variant={granularity === 'sku' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setGranularity('sku')}
                            className="h-8"
                        >
                            <Package className="h-4 w-4 mr-2" /> SKU
                        </Button>
                    </div>

                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Scenario Selector & Macro Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-slate-900 text-white border-none">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Brain className="h-6 w-6 text-purple-400" />
                            <div>
                                <h3 className="font-semibold">Active Scenario</h3>
                                <p className="text-sm text-slate-400">Adjust predictions based on market conditions</p>
                            </div>
                        </div>
                        <Tabs value={scenario} onValueChange={(v: any) => setScenario(v)} className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                                <TabsTrigger value="base">Base</TabsTrigger>
                                <TabsTrigger value="optimistic" className="data-[state=active]:bg-green-600">Optimistic</TabsTrigger>
                                <TabsTrigger value="crisis" className="data-[state=active]:bg-red-600">Crisis</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Macro Indicators Panel */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Macro Factors (Live)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><TrendingUp className="h-3 w-3 text-red-500" /> Inflation (CPI)</span>
                                <span className="font-bold">3.2%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><Store className="h-3 w-3 text-blue-500" /> Holiday Impact</span>
                                <span className="font-bold text-green-600">+15%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><AlertOctagon className="h-3 w-3 text-orange-500" /> Supply Chain</span>
                                <span className="font-bold text-orange-600">Moderate Risk</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Main Forecast Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Demand Forecast ({scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario)
                                </CardTitle>
                                <Badge variant="outline" className="capitalize">
                                    {granularity} Level
                                </Badge>
                            </div>
                            <CardDescription>
                                Projected sales volume considering seasonality, holidays, and {scenario} factors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    Generating forecast...
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={forecast}>
                                        <defs>
                                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={scenario === 'crisis' ? '#ef4444' : scenario === 'optimistic' ? '#22c55e' : '#3b82f6'} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={scenario === 'crisis' ? '#ef4444' : scenario === 'optimistic' ? '#22c55e' : '#3b82f6'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="predicted_demand"
                                            stroke={scenario === 'crisis' ? '#ef4444' : scenario === 'optimistic' ? '#22c55e' : '#3b82f6'}
                                            fillOpacity={1}
                                            fill="url(#colorDemand)"
                                            name="Predicted Demand"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Prescriptive Actions Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                Prescriptive Actions
                            </CardTitle>
                            <CardDescription>AI-recommended actions based on current scenario</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {getPrescriptions().map((item, i) => (
                                    <div key={i} className={`p-4 border rounded-lg flex items-center justify-between ${item.type === 'critical' ? 'bg-red-50 border-red-100' :
                                        item.type === 'success' ? 'bg-green-50 border-green-100' :
                                            item.type === 'warning' ? 'bg-orange-50 border-orange-100' :
                                                'bg-blue-50 border-blue-100'
                                        }`}>
                                        <div>
                                            <h4 className={`font-semibold ${item.type === 'critical' ? 'text-red-900' :
                                                item.type === 'success' ? 'text-green-900' :
                                                    item.type === 'warning' ? 'text-orange-900' :
                                                        'text-blue-900'
                                                }`}>{item.title}</h4>
                                            <p className={`text-sm mt-1 ${item.type === 'critical' ? 'text-red-700' :
                                                item.type === 'success' ? 'text-green-700' :
                                                    item.type === 'warning' ? 'text-orange-700' :
                                                        'text-blue-700'
                                                }`}>{item.description}</p>
                                        </div>
                                        <Button size="sm" variant={item.type === 'critical' ? 'destructive' : 'default'} className="ml-4">
                                            {item.action} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <WeatherWidget />
                    <AlertsPanel />

                    {/* Risk Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertOctagon className="h-5 w-5 text-red-600" />
                                High Risk Items
                            </CardTitle>
                            <CardDescription>Products with high expiration or waste risk</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {risks.filter(r => r.risk_score > 0.5).map((risk, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-100">
                                        <div>
                                            <div className="font-medium text-red-900">{risk.name}</div>
                                            <div className="text-sm text-red-700">Expires in {risk.days_to_expiry} days</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-red-600">{(risk.risk_score * 100).toFixed(0)}%</div>
                                            <div className="text-xs text-red-500">Risk Score</div>
                                        </div>
                                    </div>
                                ))}
                                {risks.filter(r => r.risk_score > 0.5).length === 0 && (
                                    <div className="text-center py-4 text-gray-500">No high-risk items detected.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ForecastingEnterprise;
