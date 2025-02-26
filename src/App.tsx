
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import KPI from "./pages/KPI";
import Users from "./pages/Users";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Notifications from "./pages/Notifications";
import Wishlist from "./pages/Wishlist";
import Plus from "./pages/Plus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
