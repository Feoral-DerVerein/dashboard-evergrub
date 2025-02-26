
import { Bell, Calendar, DollarSign, Download, Filter, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";

const CategoryButton = ({ label, isActive = false }: { label: string; isActive?: boolean }) => (
  <button
    className={`px-4 py-2 rounded-full text-sm ${
      isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
    }`}
  >
    {label}
  </button>
);

const ProductSaleItem = ({ 
  image, 
  name, 
  category, 
  unitsSold, 
  revenue 
}: { 
  image: string; 
  name: string; 
  category: string; 
  unitsSold: number; 
  revenue: number;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <img src={image} alt={name} className="w-12 h-12 rounded-lg object-cover" />
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{category}</span>
          <span>{unitsSold} units sold</span>
        </div>
      </div>
    </div>
    <span className="font-semibold">${revenue}</span>
  </div>
);

const StatCard = ({ label, value, bgColor }: { label: string; value: string; bgColor: string }) => (
  <div className={`${bgColor} p-4 rounded-xl`}>
    <h3 className="text-white text-sm mb-1">{label}</h3>
    <p className="text-white text-2xl font-semibold">{value}</p>
  </div>
);

const Sales = () => {
  const productSales = [
    {
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Organic Sourdough Bread",
      category: "Bakery",
      unitsSold: 48,
      revenue: 240
    },
    {
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Fresh Almond Milk",
      category: "Dairy",
      unitsSold: 36,
      revenue: 180
    },
    {
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Vegan Protein Bowl",
      category: "Vegan",
      unitsSold: 24,
      revenue: 312
    },
    {
      image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Craft Kombucha",
      category: "Beverages",
      unitsSold: 60,
      revenue: 300
    },
    {
      image: "https://images.unsplash.com/photo-1586buffalo-1459738-5461a7633add?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      name: "Gluten-Free Muffins",
      category: "Bakery",
      unitsSold: 42,
      revenue: 168
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Products Sales</h1>
            <Bell className="w-6 h-6 text-gray-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard 
              label="Today's Revenue" 
              value="$2,847" 
              bgColor="bg-green-600"
            />
            <StatCard 
              label="Total Orders" 
              value="126" 
              bgColor="bg-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Calendar className="w-5 h-5" />
            <span>Last 7 Days</span>
          </div>

          <div className="relative mb-6">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Filter className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
            <CategoryButton label="All" isActive />
            <CategoryButton label="Dairy" />
            <CategoryButton label="Bakery" />
            <CategoryButton label="Vegan" />
            <CategoryButton label="Beverages" />
          </div>
        </header>

        <main className="px-6">
          <h2 className="text-xl font-semibold mb-4">Product Sales</h2>
          <div className="space-y-1">
            {productSales.map((product, index) => (
              <ProductSaleItem key={index} {...product} />
            ))}
          </div>

          <button className="w-full bg-green-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 mt-6">
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Sales;
