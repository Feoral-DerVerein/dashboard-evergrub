
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
  
  useEffect(() => {
    // Only redirect after loading is complete and there's no user
    if (!loading && !user && location.pathname !== '/') {
      console.log("ProtectedRoute: No user, redirecting to / from", location.pathname);
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);
  
  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-700"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }
  
  // Only render children if user is authenticated
  return user ? children : null;
};

// Component to redirect to dashboard if already authenticated
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect after loading is complete and there is a user
    if (!loading && user) {
      console.log("AuthRoute: User found, redirecting to /dashboard from login");
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);
  
  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-700"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }
  
  // Only render children if user is not authenticated
  return !user ? children : null;
};

// Content component that handles routes
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-700"></div>
        <span className="ml-2">Cargando autenticación...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      
      {/* Protected routes */}
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
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
