
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/kpi" element={<KPI />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<NotFound />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/plus" element={<Plus />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          <Route path="/store-profile" element={<StoreProfile />} />
          <Route path="/parcel" element={<Parcel />} />
          <Route path="/parcel/:id" element={<ParcelDetails />} />
          <Route path="/microsoft" element={<Microsoft />} />
          <Route path="/google" element={<Google />} />
          <Route path="/apple" element={<Apple />} />
          <Route path="/phone" element={<Phone />} />
          <Route path="/reports" element={<NotFound />} />
          <Route path="/analytics" element={<NotFound />} />
          <Route path="/support" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/help" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
