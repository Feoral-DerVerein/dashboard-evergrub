
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext"; 
import Index from "./pages/Index";
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

// Componente para proteger rutas que requieren autenticación
// Important: This component must be used inside the BrowserRouter and AuthProvider
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      console.log("ProtectedRoute: No user, redirecting to login");
      // Instead of using navigate, we return a Navigate component
      return;
    }
  }, [user, loading]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/" replace />;
};

// Main App Component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <OrderProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
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
          </OrderProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
