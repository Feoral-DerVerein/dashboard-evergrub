
import BottomNav from "@/components/navigation/BottomNav";
import { Bell, Filter, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EventOrders = () => {
  const filters = ["All Orders", "Corporate", "Nightclub", "Wedding"];
  const orders = [
    {
      title: "Corporate Lunch - Tech Co",
      time: "Today, 12:30 PM",
      amount: "$1,240",
      status: "Pending"
    },
    {
      title: "Nightclub Event",
      time: "Tomorrow, 8:00 PM",
      amount: "$2,850",
      status: "Processing"
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Event Orders</h2>
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((filter, index) => (
          <Button
            key={filter}
            variant={index === 0 ? "default" : "outline"}
            className="whitespace-nowrap"
          >
            {filter}
          </Button>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Event Orders</h2>
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{order.title}</h3>
                <p className="text-gray-500 flex items-center gap-1">
                  <span className="inline-block">{order.time}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-semibold text-lg">{order.amount}</p>
                <span className={cn(
                  "inline-block px-2 py-1 rounded text-sm",
                  order.status === "Pending" ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-600"
                )}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Accept Order
              </Button>
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpiringSoon = () => {
  const items = [
    {
      name: "Soft Drinks Assorted",
      units: "20 units",
      daysLeft: 3,
      discount: 25
    },
    {
      name: "Fresh Juice Pack",
      units: "15 units",
      daysLeft: 2,
      discount: 30
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Expiring Soon</h2>
        <Button variant="link" className="text-blue-600">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">{item.units}</p>
              </div>
              <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-red-600">
                {item.daysLeft} days left
              </span>
            </div>
            <div className="mt-2">
              <p className="text-gray-600 mb-2">
                Suggested Discount: {item.discount} %
              </p>
              <Button variant="destructive" className="w-full">
                Create Offer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Plus = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">WiseBite Plus</h1>
            <Button variant="ghost" size="icon">
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <main className="px-6">
          <EventOrders />
          <ExpiringSoon />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Plus;
