
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Circle, TrendingUp, DollarSign, ShoppingBag, Settings, Home, User, Heart, Bell, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson && location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 flex justify-around items-center px-6 max-w-md mx-auto z-20">
      <Link to="/dashboard" className={`flex flex-col items-center ${location.pathname === "/dashboard" ? "text-blue-600" : "text-gray-500"}`}>
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/orders" className={`flex flex-col items-center ${location.pathname === "/orders" ? "text-blue-600" : "text-gray-500"}`}>
        <ShoppingBag className="h-6 w-6" />
        <span className="text-xs mt-1">Orders</span>
      </Link>
      <Link to="/wishlist" className={`flex flex-col items-center ${location.pathname === "/wishlist" ? "text-blue-600" : "text-gray-500"}`}>
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Wishlist</span>
      </Link>
      <Link to="/notifications" className="relative flex flex-col items-center text-gray-500">
        <Bell className="h-6 w-6" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
        <span className="text-xs mt-1">Alerts</span>
      </Link>
      <Link to="/account" className={`flex flex-col items-center ${location.pathname === "/account" ? "text-blue-600" : "text-gray-500"}`}>
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Account</span>
      </Link>
    </div>
  );
};

const data = [
  { name: "Jan", sales: 50 },
  { name: "Feb", sales: 80 },
  { name: "Mar", sales: 30 },
  { name: "Apr", sales: 90 },
  { name: "May", sales: 120 },
  { name: "Jun", sales: 100 },
];

const RecentOrders = [
  { id: "ORD001", customer: "John Doe", status: "Delivered", amount: "$45.50", date: "2023-05-01" },
  { id: "ORD002", customer: "Jane Smith", status: "Processing", amount: "$98.20", date: "2023-05-02" },
  { id: "ORD003", customer: "Bob Johnson", status: "Pending", amount: "$124.00", date: "2023-05-03" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/');
    } else {
      setUserProfile(JSON.parse(userJson));
    }
    
    // Check if store profile exists
    const storeJson = localStorage.getItem('storeProfile');
    if (storeJson) {
      setStoreProfile(JSON.parse(storeJson));
    }
  }, [navigate]);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-md mx-auto bg-white">
        <header className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/lovable-uploads/a18ff71a-0b3e-4795-a638-dd589a1a82ee.png"
              alt="WiseBite"
              className="h-6 w-auto mr-2"
            />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center">
            <Link to="/notifications">
              <div className="relative mr-4">
                <Bell className="h-6 w-6 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
              </div>
            </Link>
            <Link to="/account">
              <Avatar className="h-8 w-8">
                {userProfile?.avatar ? (
                  <AvatarImage src={userProfile.avatar} />
                ) : null}
                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {!storeProfile ? (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-blue-100 p-3 rounded-full">
                    <Store className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-800 mb-1">Set up your store</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Create your store profile to start selling on the marketplace
                    </p>
                    <button
                      onClick={() => navigate('/store-profile')}
                      className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Store Profile
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <h3 className="text-2xl font-bold">$1,245</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5%
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Orders</p>
                    <h3 className="text-2xl font-bold">24</h3>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2%
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/products/add')}
                className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Add Product</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button
                onClick={() => navigate('/parcel')}
                className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium">Track Order</span>
              </button>
              <button
                onClick={() => navigate('/sales')}
                className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">View Sales</span>
              </button>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

// Add missing Store icon
const Store = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
    <path d="M2 7h20"/>
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
  </svg>
);

export default Dashboard;
