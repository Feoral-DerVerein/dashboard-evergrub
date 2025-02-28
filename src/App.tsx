
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import KPI from "./pages/KPI";
import Users from "./pages/Users";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Notifications from "./pages/Notifications";
import Wishlist from "./pages/Wishlist";
import Plus from "./pages/Plus";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import StoreProfile from "./pages/StoreProfile";
import NotFound from "./pages/NotFound";
import Parcel from "./pages/Parcel";
import ParcelDetails from "./pages/ParcelDetails";
import Microsoft from "./pages/Microsoft";
import Google from "./pages/Google";
import Apple from "./pages/Apple";
import Phone from "./pages/Phone";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/kpi" element={<ProtectedRoute><KPI /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/users/add" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/plus" element={<ProtectedRoute><Plus /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/store-profile" element={<ProtectedRoute><StoreProfile /></ProtectedRoute>} />
      <Route path="/parcel" element={<ProtectedRoute><Parcel /></ProtectedRoute>} />
      <Route path="/parcel/:id" element={<ProtectedRoute><ParcelDetails /></ProtectedRoute>} />
      <Route path="/microsoft" element={<ProtectedRoute><Microsoft /></ProtectedRoute>} />
      <Route path="/google" element={<ProtectedRoute><Google /></ProtectedRoute>} />
      <Route path="/apple" element={<ProtectedRoute><Apple /></ProtectedRoute>} />
      <Route path="/phone" element={<ProtectedRoute><Phone /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
