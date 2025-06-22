
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Products from "@/pages/Products";
import AddProduct from "@/pages/AddProduct";
import Sales from "@/pages/Sales";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import KPI from "@/pages/KPI";
import Ads from "@/pages/Ads";
import CreateAd from "@/pages/CreateAd";
import Donate from "@/pages/Donate";
import Grains from "@/pages/Grains";
import Wishlist from "@/pages/Wishlist";
import Users from "@/pages/Users";
import PaymentPortal from "@/pages/PaymentPortal";
import Partners from "@/pages/Partners";
import Login from "@/pages/Login";
import Phone from "@/pages/Phone";
import Apple from "@/pages/Apple";
import Google from "@/pages/Google";
import Microsoft from "@/pages/Microsoft";
import Plus from "@/pages/Plus";
import NotFound from "@/pages/NotFound";
import AuthRoute from "@/components/auth/AuthRoutes";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";

const MainRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Auth routes - only accessible when not logged in */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/phone" element={<AuthRoute><Phone /></AuthRoute>} />
      <Route path="/apple" element={<AuthRoute><Apple /></AuthRoute>} />
      <Route path="/google" element={<AuthRoute><Google /></AuthRoute>} />
      <Route path="/microsoft" element={<AuthRoute><Microsoft /></AuthRoute>} />
      <Route path="/plus" element={<AuthRoute><Plus /></AuthRoute>} />
      
      {/* Protected routes - only accessible when logged in */}
      <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/kpi" element={<ProtectedRoute><KPI /></ProtectedRoute>} />
      <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
      <Route path="/ads/create" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
      <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
      <Route path="/grains" element={<ProtectedRoute><Grains /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><PaymentPortal /></ProtectedRoute>} />
      <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
      
      {/* Default redirects */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
