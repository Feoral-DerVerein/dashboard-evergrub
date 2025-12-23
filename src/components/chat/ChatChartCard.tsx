import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

export interface ChatChartData {
    title: string;
    type: 'line' | 'bar' | 'area';
    data: any[];
    dataKey: string;
    categoryKey: string;
    color?: string;
    description?: string;
}

interface ChatChartCardProps {
    chartData: ChatChartData;
}

export function ChatChartCard({ chartData }: ChatChartCardProps) {
    const { title, type, data, dataKey, categoryKey, color = "#10b981", description } = chartData;

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <XAxis
                            dataKey={categoryKey}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '12px'
                            }}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey={categoryKey}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#gradient-${dataKey})`}
                        />
                    </AreaChart>
                );
            case 'line':
            default:
                return (
                    <LineChart data={data}>
                        <XAxis
                            dataKey={categoryKey}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '12px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 3, fill: color }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <Card className="w-full max-w-sm border border-gray-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="h-[180px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
                {description && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
