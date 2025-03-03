
import { useState } from "react";
import { Eye, X, Printer, MapPin, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BottomNav } from "@/components/Dashboard";

interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerImage: string;
  items: OrderItem[];
  status: "pending" | "completed" | "accepted";
  timestamp: string;
  total: number;
  location: string;
  phone: string;
  specialRequest?: string;
}

const orders: Order[] = [
  {
    id: "#12345",
    customerName: "John Smith",
    customerImage: "/lovable-uploads/65fec487-8a30-491a-954f-ddfffdb5e9ca.png",
    items: [
      { id: "1", name: "Milk (1L)", category: "Dairy", price: 3.00, quantity: 2 },
      { id: "2", name: "Whole Wheat Bread", category: "Bakery", price: 4.50, quantity: 1 },
      { id: "3", name: "Orange Juice", category: "Beverages", price: 5.98, quantity: 2 }
    ],
    status: "pending",
    timestamp: "2:30 PM",
    total: 89.50,
    location: "Hobart",
    phone: "+1 234 567 8900",
    specialRequest: "No plastic bags please"
  },
  {
    id: "#12346",
    customerName: "Emma Davis",
    customerImage: "/placeholder.svg",
    items: [
      { id: "4", name: "Coffee", category: "Beverages", price: 12.99, quantity: 1 },
      { id: "5", name: "Cookies", category: "Snacks", price: 4.99, quantity: 2 }
    ],
    status: "completed",
    timestamp: "3:15 PM",
    total: 45.75,
    location: "Sydney",
    phone: "+1 234 567 8901"
  }
];

const OrderCard = ({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
    <div className="flex items-center justify-between">
      <div className="font-medium text-gray-600">{order.id}</div>
      <div className={`text-sm ${
        order.status === "completed" ? "text-green-500" : 
        order.status === "pending" ? "text-orange-500" : "text-blue-500"
      }`}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </div>
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={order.customerImage} alt={order.customerName} />
          <AvatarFallback>{order.customerName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.items.length} items</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">${order.total.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{order.timestamp}</p>
        </div>
        <button onClick={() => onViewDetails(order)} className="text-blue-500">
          <Eye className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const OrderDetailsModal = ({ order, isOpen, onClose }: { order: Order | null; isOpen: boolean; onClose: () => void }) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Order Details</h2>
          <button className="text-gray-500">
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <div className="text-gray-600">Order ID</div>
              <div className={`text-sm ${
                order.status === "completed" ? "text-green-500" : 
                order.status === "pending" ? "text-orange-500" : "text-blue-500"
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            <div className="font-semibold">{order.id}</div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={order.customerImage} alt={order.customerName} />
              <AvatarFallback>{order.customerName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-sm text-gray-500">Regular Customer</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span>{order.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Phone className="w-4 h-4" />
              <span>{order.phone}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-2">
              <span>Total</span>
              <span className="text-blue-600">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.specialRequest && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-1">Special Request</p>
              <p className="text-sm text-blue-800">{order.specialRequest}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Orders = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (order) => filter === "all" || order.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 mb-6">
            {/* Eliminando la flecha negra de la esquina superior */}
            <h1 className="text-2xl font-bold">Orders Dashboard</h1>
          </div>
          <p className="text-gray-500 mb-4">Today's Orders</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === "accepted"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Completed
            </button>
          </div>
        </header>

        <main className="px-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={(order) => setSelectedOrder(order)}
            />
          ))}
        </main>

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />

        <BottomNav />
      </div>
    </div>
  );
};

export default Orders;
