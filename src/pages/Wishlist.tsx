import { Bell, Menu } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  status: "Ready Now" | "Limited Stock" | "Out of Stock";
  timeLeft: string;
}

const wishlistItems: WishlistItem[] = [
  {
    id: 1,
    name: "Fresh Organic Bananas",
    price: 4.99,
    unit: "bunch",
    image: "/lovable-uploads/459ad899-55f0-42cb-9ff4-8065a49cfafd.png",
    status: "Ready Now",
    timeLeft: "2 days left"
  },
  {
    id: 2,
    name: "Fresh Milk",
    price: 3.49,
    unit: "gallon",
    image: "/placeholder.svg",
    status: "Limited Stock",
    timeLeft: "10 days left"
  },
  {
    id: 3,
    name: "Organic Eggs",
    price: 5.99,
    unit: "dozen",
    image: "/placeholder.svg",
    status: "Out of Stock",
    timeLeft: ""
  },
  {
    id: 4,
    name: "Whole Grain Bread",
    price: 4.29,
    unit: "loaf",
    image: "/placeholder.svg",
    status: "Ready Now",
    timeLeft: "20 hours left"
  },
  {
    id: 5,
    name: "Fresh Avocados",
    price: 6.99,
    unit: "bag",
    image: "/placeholder.svg",
    status: "Limited Stock",
    timeLeft: "1 day left"
  }
];

const WishlistItem = ({ item }: { item: WishlistItem }) => {
  const getStatusColor = (status: WishlistItem["status"]) => {
    switch (status) {
      case "Ready Now":
        return "bg-green-100 text-green-600";
      case "Limited Stock":
        return "bg-orange-100 text-orange-600";
      case "Out of Stock":
        return "bg-red-100 text-red-600";
    }
  };

  const getButtonStyle = (status: WishlistItem["status"]) => {
    if (status === "Ready Now") {
      return "bg-blue-500 text-white px-6";
    }
    return "border border-blue-500 text-blue-500 px-4";
  };

  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
          {item.timeLeft && (
            <span className="text-sm text-gray-500">{item.timeLeft}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-semibold">
            ${item.price} / {item.unit}
          </span>
          <button
            className={`rounded-full py-2 ${getButtonStyle(item.status)}`}
          >
            {item.status === "Ready Now" ? "Notify" : "Notify When Ready"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const readyItems = wishlistItems.filter(item => item.status === "Ready Now").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Menu className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-bold">Clients Wishlist</h1>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              <span className="font-medium">{wishlistItems.length} Items</span> in Wishlist
            </p>
            <div className="mt-2 bg-gray-200 h-2 rounded-full">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(readyItems / wishlistItems.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-blue-500 text-sm mt-1">{readyItems} Items Ready</p>
          </div>
        </header>

        <main className="divide-y divide-gray-100">
          {wishlistItems.map(item => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Wishlist;
