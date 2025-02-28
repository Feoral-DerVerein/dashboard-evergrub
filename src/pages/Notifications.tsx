import { Bell, Eye, Home, Plus, ShoppingBag, User, AlertTriangle, Heart, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/navigation/BottomNav";

interface NotificationItem {
  id: number;
  type: "order" | "stock" | "wishlist" | "report";
  title: string;
  description: string;
  time: string;
}

const notifications: NotificationItem[] = [
  {
    id: 12345,
    type: "order",
    title: "New Order! #12345",
    description: "John Smith placed an order for $20.50",
    time: "2 mins ago"
  },
  {
    id: 1,
    type: "stock",
    title: "Stock Alert!",
    description: "Product 'Milk' is low in stock",
    time: "15 mins ago"
  },
  {
    id: 2,
    type: "wishlist",
    title: "Wishlist Trend",
    description: '10 users added "Coke" to wishlist',
    time: "1 hour ago"
  },
  {
    id: 3,
    type: "report",
    title: "Sales Report Update",
    description: "Monthly sales report is now available",
    time: "2 hours ago"
  },
  {
    id: 12346,
    type: "order",
    title: "New Order! #12346",
    description: "Jane Smith placed an order for $30",
    time: "3 hours ago"
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-6 h-6" };
  const wrapperClassName = "w-10 h-10 rounded-full flex items-center justify-center";

  switch (type) {
    case "order":
      return <div className={`${wrapperClassName} bg-green-100`}><ShoppingBag {...iconProps} className="text-green-600" /></div>;
    case "stock":
      return <div className={`${wrapperClassName} bg-red-100`}><AlertTriangle {...iconProps} className="text-red-600" /></div>;
    case "wishlist":
      return <div className={`${wrapperClassName} bg-blue-100`}><Heart {...iconProps} className="text-blue-600" /></div>;
    case "report":
      return <div className={`${wrapperClassName} bg-purple-100`}><BarChart {...iconProps} className="text-purple-600" /></div>;
    default:
      return <div className={`${wrapperClassName} bg-gray-100`}><Bell {...iconProps} className="text-gray-600" /></div>;
  }
};

const Notifications = () => {
  const totalNotifications = notifications.length;
  const currentPage = 1;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalNotifications / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Eye className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        <main className="px-6">
          <p className="text-gray-500 mb-6">You have {totalNotifications} notifications</p>

          <div className="space-y-6">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-4">
                <NotificationIcon type={notification.type} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-gray-500">{notification.description}</p>
                  <p className="text-sm text-gray-400 mt-1">{notification.time}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Eye className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center space-x-2 my-8">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded-full ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Notifications;
