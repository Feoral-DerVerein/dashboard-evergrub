
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Profile from "@/pages/Profile";
import AddProduct from "@/pages/AddProduct";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import KPI from "@/pages/KPI";
import Ads from "@/pages/Ads";
import CreateAd from "@/pages/CreateAd";
import Donate from "@/pages/Donate";
import Users from "@/pages/Users";
import PaymentPortal from "@/pages/PaymentPortal";
import Onboarding from "@/pages/Onboarding";
import Pricing from "@/pages/Pricing";

import Login from "@/pages/Login";
import Apple from "@/pages/Apple";
import NotFound from "@/pages/NotFound";
import AuthRoute from "@/components/auth/AuthRoutes";
import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import AppLayout from "@/components/layout/AppLayout";
import ImportProducts from "@/pages/ImportProducts";
import ProductSync from "@/pages/ProductSync";
import ConnectPOS from "@/pages/ConnectPOS";
import POSIntegrations from "@/pages/POSIntegrations";


const MainRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Auth routes - only accessible when not logged in */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/apple" element={<AuthRoute><Apple /></AuthRoute>} />
      
      {/* Onboarding route - accessible only when logged in but onboarding not completed */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      
      {/* Pricing route - accessible after onboarding */}
      <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      
      {/* Protected routes - only accessible when logged in */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Navigate to="/kpi" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/edit/:id" element={<AddProduct />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/kpi" element={<KPI />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/ads/create" element={<CreateAd />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payment" element={<PaymentPortal />} />
        
        <Route path="/import" element={<ImportProducts />} />
        <Route path="/sync" element={<ProductSync />} />
        <Route path="/connect-pos" element={<ConnectPOS />} />
        <Route path="/pos-integrations" element={<POSIntegrations />} />
        
      </Route>
      
      {/* Default redirects */}
      <Route path="/" element={
        user ? <Navigate to="/kpi" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
