import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/components/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Products from "@/pages/Products";
import AddProduct from "@/pages/AddProduct";
import Orders from "@/pages/Orders";
import Sales from "@/pages/Sales";
import Notifications from "@/pages/Notifications";
import KPI from "@/pages/KPI";
import Ads from "@/pages/Ads";
import CreateAd from "@/pages/CreateAd";
import Donate from "@/pages/Donate";
import Grains from "@/pages/Grains";
import Wishlist from "@/pages/Wishlist";
import PaymentPortal from "@/pages/PaymentPortal";
import Users from "@/pages/Users";
import Phone from "@/pages/Phone";
import Google from "@/pages/Google";
import Apple from "@/pages/Apple";
import Microsoft from "@/pages/Microsoft";
import Plus from "@/pages/Plus";
import NotFound from "@/pages/NotFound";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/add" element={<AddProduct />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/kpi" element={<KPI />} />
      <Route path="/ads" element={<Ads />} />
      <Route path="/ads/create" element={<CreateAd />} />
      <Route path="/donate" element={<Donate />} />
      <Route path="/grains" element={<Grains />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/payment" element={<PaymentPortal />} />
      <Route path="/users" element={<Users />} />
      <Route path="/login/phone" element={<Phone />} />
      <Route path="/login/google" element={<Google />} />
      <Route path="/login/apple" element={<Apple />} />
      <Route path="/login/microsoft" element={<Microsoft />} />
      <Route path="/login/plus" element={<Plus />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
