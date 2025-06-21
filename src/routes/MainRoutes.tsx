
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
import AuthRoute from "@/components/auth/AuthRoutes";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AuthRoute>
          <Index />
        </AuthRoute>
      } />
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/login/phone" element={
        <AuthRoute>
          <Phone />
        </AuthRoute>
      } />
      <Route path="/login/google" element={
        <AuthRoute>
          <Google />
        </AuthRoute>
      } />
      <Route path="/login/apple" element={
        <AuthRoute>
          <Apple />
        </AuthRoute>
      } />
      <Route path="/login/microsoft" element={
        <AuthRoute>
          <Microsoft />
        </AuthRoute>
      } />
      <Route path="/login/plus" element={
        <AuthRoute>
          <Plus />
        </AuthRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      } />
      <Route path="/products/add" element={
        <ProtectedRoute>
          <AddProduct />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute>
          <Sales />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/kpi" element={
        <ProtectedRoute>
          <KPI />
        </ProtectedRoute>
      } />
      <Route path="/ads" element={
        <ProtectedRoute>
          <Ads />
        </ProtectedRoute>
      } />
      <Route path="/ads/create" element={
        <ProtectedRoute>
          <CreateAd />
        </ProtectedRoute>
      } />
      <Route path="/donate" element={
        <ProtectedRoute>
          <Donate />
        </ProtectedRoute>
      } />
      <Route path="/grains" element={
        <ProtectedRoute>
          <Grains />
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute>
          <PaymentPortal />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
