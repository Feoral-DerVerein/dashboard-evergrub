import { Bell, Filter } from "lucide-react";
import { BottomNav } from "@/components/Dashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EventOrder {
  id: string;
  title: string;
  time: string;
  amount: number;
  status: "Pending" | "Processing";
  type: "Corporate" | "Nightclub" | "Wedding";
  items: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    image: string;
    detailImage: string;
    expires?: string;
    discount?: number;
  }>;
}

const eventOrders: EventOrder[] = [
  {
    id: "#WB78945",
    title: "Corporate Lunch - Tech Co",
    time: "Today, 12:30 PM",
    amount: 1240,
    status: "Pending",
    type: "Corporate",
    items: [
      {
        id: "1",
        name: "Coke",
        category: "Lunch",
        quantity: 20,
        price: 100,
        image: "/lovable-uploads/e6294b5d-ff9b-47fa-96a4-588f2e280a0e.png",
        detailImage: "/lovable-uploads/cc2e9f85-2ce6-4059-85c1-292d74b99aa3.png",
        expires: "Sep 14, 2023",
        discount: 15
      }
    ]
  },
  {
    id: "#WB78946",
    title: "Nightclub Event",
    time: "Tomorrow, 8:00 PM",
    amount: 2850,
    status: "Processing",
    type: "Nightclub",
    items: [
      {
        id: "2",
        name: "Wine",
        category: "Drinks",
        quantity: 10,
        price: 285,
        image: "/placeholder.svg",
        detailImage: "/placeholder.svg"
      }
    ]
  }
];

const OrderItem = ({ order }: { order: EventOrder }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{order.title}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              {order.time}
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-600 font-semibold text-lg">
              ${order.amount.toLocaleString()}
            </p>
            <span className={`text-sm px-3 py-1 rounded-full ${
              order.status === "Pending" 
                ? "bg-orange-100 text-orange-600"
                : "bg-yellow-100 text-yellow-600"
            }`}>
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Accept Order
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md mx-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Order ID: {order.id}</p>
                <h2 className="text-xl font-semibold">{order.title}</h2>
                <p className="text-gray-600">{order.type}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                order.status === "Pending" 
                  ? "bg-orange-100 text-orange-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="font-semibold">
                  {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Order Value</p>
                <p className="font-semibold">${order.amount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Left</p>
                <p className="font-semibold">1 Week</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Order Items ({order.items.length})</h3>
                <button className="text-blue-600 text-sm flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {order.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex gap-3">
                    <img 
                      src={item.detailImage} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-gray-500 text-sm">{item.category}</p>
                        </div>
                        <p className="font-medium">x {item.quantity}</p>
                      </div>
                      <div className="mt-2 flex justify-between items-end">
                        <div>
                          <p className="font-semibold">
                            $ {item.price}
                            {item.discount && (
                              <span className="text-red-500 text-sm ml-1">
                                -{item.discount}%
                              </span>
                            )}
                          </p>
                          {item.expires && (
                            <p className="text-orange-500 text-sm">
                              Expires: {item.expires}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Check Inventory
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Process Order
            </Button>
            <Button variant="ghost" className="w-full text-red-500 hover:text-red-600">
              Cancel Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Wishlist = () => {
  const [filter, setFilter] = useState<"All Orders" | "Corporate" | "Nightclub" | "Wedding">("All Orders");

  const filteredOrders = filter === "All Orders" 
    ? eventOrders
    : eventOrders.filter(order => order.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">WiseBite Plus</h1>
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <h2 className="text-xl font-semibold mb-4">Event Orders</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All Orders", "Corporate", "Nightclub", "Wedding"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </header>

        <main className="p-6">
          {filteredOrders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Wishlist;
