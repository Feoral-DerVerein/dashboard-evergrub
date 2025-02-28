
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
};

const categories = ["All", "Fruits", "Bread", "Dairy", "Meat", "Beverages"];

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Fresh Organic Bananas",
    price: 2.99,
    category: "Fruits",
    image: "/lovable-uploads/557180f2-5bec-429f-bd15-819ceb7125a8.png"
  },
  {
    id: 2,
    name: "Whole Grain Bread",
    price: 3.49,
    category: "Bread",
    image: "/lovable-uploads/4f94a856-2c39-4c16-9c3d-3ae6fdf872ed.png"
  },
  {
    id: 3,
    name: "Fresh Milk",
    price: 1.99,
    category: "Dairy",
    image: "/lovable-uploads/a3172ad7-521b-4bff-a334-94b79ec5e1bf.png"
  },
  {
    id: 4,
    name: "Butter",
    price: 2.49,
    category: "Dairy",
    image: "/lovable-uploads/57d5a65f-f4d4-44de-bc3f-090ee9d3e6c8.png"
  },
  {
    id: 5,
    name: "Ice Cream",
    price: 3.99,
    category: "Dairy",
    image: "/lovable-uploads/08f9eaaa-edef-49b5-a4e1-a990c6362c76.png"
  },
  {
    id: 6,
    name: "Ground Beef",
    price: 4.99,
    category: "Meat",
    image: "/lovable-uploads/a8d0ed43-9247-43c0-b4b7-0b73bca854af.png"
  },
  {
    id: 7,
    name: "Chicken Breast",
    price: 3.99,
    category: "Meat",
    image: "/lovable-uploads/3a65a638-e8e8-4a0f-a8c4-cc2693037034.png"
  }
];

const Products = () => {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalProducts = products.length;
  const outOfStock = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in">
        <div className="px-6 pt-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500">Manage your products</p>
            </div>
            <Link
              to="/products/add"
              className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-500">{outOfStock}</p>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-green-600 font-medium mb-2">$ {product.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Products;
