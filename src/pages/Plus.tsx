
import { Bell, Filter } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";

type OrderStatus = "Pending" | "Processing" | "Completed";
type EventType = "All Orders" | "Corporate" | "Nightclub" | "Wedding";

interface EventOrder {
  id: string;
  title: string;
  time: string;
  amount: number;
  status: OrderStatus;
  items: OrderItem[];
  type: Exclude<EventType, "All Orders">;
  deliveryDate: string;
}

interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  discount?: number;
  image: string;
  expiry: string;
}

interface ExpiringItem {
  id: string;
  name: string;
  units: number;
  discount: number;
  daysLeft: number;
}

const eventOrders: EventOrder[] = [
  {
    id: "#WB78945",
    title: "Corporate Lunch - Tech Co",
    time: "Today, 12:30 PM",
    amount: 1240,
    status: "Pending",
    type: "Corporate",
    deliveryDate: "Sep 15, 2024",
    items: [
      {
        id: "1",
        name: "Coke",
        category: "Lunch",
        quantity: 20,
        price: 100,
        discount: 15,
        image: "/lovable-uploads/7115bc02-9a27-4bbd-96c8-f662d773f292.png",
        expiry: "Sep 14, 2023"
      },
      {
        id: "2",
        name: "Chips",
        category: "Healthy",
        quantity: 15,
        price: 60,
        image: "/lovable-uploads/82973905-0aac-44ba-a47b-609eb953b31d.png",
        expiry: "Sep 14, 2023"
      },
      {
        id: "3",
        name: "Wine",
        category: "Snacks",
        quantity: 10,
        price: 300,
        image: "/placeholder.svg",
        expiry: "Sep 14, 2023"
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
    deliveryDate: "Sep 15, 2024",
    items: []
  }
];

const expiringItems: ExpiringItem[] = [
  {
    id: "1",
    name: "Soft Drinks Assorted",
    units: 20,
    discount: 25,
    daysLeft: 3
  },
  {
    id: "2",
    name: "Fresh Juice Pack",
    units: 15,
    discount: 30,
    daysLeft: 2
  }
];

const OrderDetailsDialog = ({ order, open, onClose }: { order: EventOrder; open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-500">Order ID: {order.id}</p>
                <h2 className="text-xl font-semibold">{order.title}</h2>
                <p className="text-gray-500">{order.type}</p>
                <p className="text-gray-500">Delivery by {order.deliveryDate}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {order.status}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">Total Items</p>
            <p className="font-semibold">45 items</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">Order Value</p>
            <p className="font-semibold">${order.amount}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">Time Left</p>
            <p className="font-semibold">1 Week</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Order Items ({order.items.length})</h3>
            <button className="text-blue-500 text-sm">Filter</button>
          </div>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <span className="font-semibold">x {item.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${item.price}</span>
                      {item.discount && (
                        <span className="text-red-500 text-sm">-{item.discount}%</span>
                      )}
                    </div>
                    <span className="text-orange-500 text-sm">Expires: {item.expiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full py-3 bg-blue-500 text-white rounded-lg">
            Check Inventory
          </button>
          <button className="w-full py-3 bg-green-600 text-white rounded-lg">
            Process Order
          </button>
          <button className="w-full py-3 text-red-500">
            Cancel Order
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Plus = () => {
  const [selectedType, setSelectedType] = useState<EventType>("All Orders");
  const [selectedOrder, setSelectedOrder] = useState<EventOrder | null>(null);

  const filteredOrders = selectedType === "All Orders"
    ? eventOrders
    : eventOrders.filter(order => order.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">WiseBite Plus</h1>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
          </div>
        </header>

        <main className="px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Event Orders</h2>
            <button className="flex items-center text-blue-500">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </button>
          </div>

          <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
            {["All Orders", "Corporate", "Nightclub", "Wedding"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as EventType)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedType === type
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{order.title}</h3>
                    <p className="text-gray-500 text-sm">{order.time}</p>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    ${order.amount}
                  </span>
                </div>
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      order.status === "Pending"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 py-2 bg-green-600 text-white rounded-lg">
                    Accept Order
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Expiring Soon</h2>
              <button className="text-blue-500">View All</button>
            </div>

            <div className="space-y-4">
              {expiringItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-500">{item.units} units</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                      {item.daysLeft} days left
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Suggested Discount: {item.discount} %
                    </p>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                      Create Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <BottomNav />

        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Plus;
