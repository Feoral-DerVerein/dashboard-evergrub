
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const data = [
  { name: "Jan", sales: 50 },
  { name: "Feb", sales: 80 },
  { name: "Mar", sales: 30 },
  { name: "Apr", sales: 90 },
  { name: "May", sales: 120 },
  { name: "Jun", sales: 100 },
];

const SalesOverviewCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Your store performance this month</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#4C956C" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOverviewCard;
