
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

const RecentOrders = [
  { id: "ORD001", customer: "John Doe", status: "Delivered", amount: "$45.50", date: "2023-05-01" },
  { id: "ORD002", customer: "Jane Smith", status: "Processing", amount: "$98.20", date: "2023-05-02" },
  { id: "ORD003", customer: "Bob Johnson", status: "Pending", amount: "$124.00", date: "2023-05-03" },
];

const RecentOrdersSection = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Link to="/orders" className="text-sm text-blue-600">View All</Link>
      </div>
      <div className="space-y-3">
        {RecentOrders.map((order) => (
          <div key={order.id} className="border rounded-lg p-3 flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{order.id}</h3>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">{order.date}</span>
              </div>
              <p className="text-sm text-gray-500">{order.customer}</p>
            </div>
            <div className="flex items-center">
              <span className="mr-3 font-medium">{order.amount}</span>
              <Badge variant={order.status === "Delivered" ? "outline" : order.status === "Processing" ? "secondary" : "default"} className="gap-1 flex items-center">
                <Circle className="h-2 w-2 fill-current" />
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrdersSection;
