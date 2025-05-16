import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext"; 
import Dashboard from "./components/Dashboard";
import Login from "./pages/Login";
import KPI from "./pages/KPI";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Plus from "./pages/Plus";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Microsoft from "./pages/Microsoft";
import Google from "./pages/Google";
import Apple from "./pages/Apple";
import Phone from "./pages/Phone";
import Sales from "./pages/Sales";
import Ads from "./pages/Ads";
import CreateAd from "./pages/CreateAd";
import PaymentPortal from "./pages/PaymentPortal";
import Donate from "./pages/Donate";

const queryClient = new QueryClient();

// Main application that configures providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <OrderProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </OrderProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      if (!user && location.pathname !== '/') {
        console.log("ProtectedRoute: No user, redirecting to /");
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);
  
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return user ? children : null;
};

// Component to redirect to dashboard if already authenticated
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      if (user) {
        console.log("AuthRoute: User found, redirecting to /dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);
  
  if (loading || isChecking) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return !user ? children : null;
};

// Content component that handles routes
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/kpi" element={
        <ProtectedRoute>
          <KPI />
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
      <Route path="/products/edit/:id" element={
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
      <Route path="/plus" element={
        <ProtectedRoute>
          <Plus />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/microsoft" element={
        <ProtectedRoute>
          <Microsoft />
        </ProtectedRoute>
      } />
      <Route path="/google" element={
        <ProtectedRoute>
          <Google />
        </ProtectedRoute>
      } />
      <Route path="/apple" element={
        <ProtectedRoute>
          <Apple />
        </ProtectedRoute>
      } />
      <Route path="/phone" element={
        <ProtectedRoute>
          <Phone />
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
      <Route path="/payment-portal" element={
        <ProtectedRoute>
          <PaymentPortal />
        </ProtectedRoute>
      } />
      <Route path="/donate" element={
        <ProtectedRoute>
          <Donate />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      <Route path="/support" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
