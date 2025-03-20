import { ShoppingBag, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesAlerts from "@/components/sales/SalesAlerts";
import ProductList from "@/components/sales/ProductList";
import { useSalesData } from "@/hooks/useSalesData";
const Sales = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const navigate = useNavigate();
  const {
    todayRevenue,
    totalOrders,
    productSales,
    isLoading,
    newAcceptedOrderId,
    newCompletedOrderId,
    newCompletedOrderAmount,
    newMarketplaceCompletedOrder,
    newOrdersPageAccepted
  } = useSalesData();
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  const navigateToOrders = () => {
    navigate('/orders');
  };
  const getCategories = () => {
    const categories = new Set(['All']);
    productSales.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  };
  const filteredProducts = activeCategory === "All" ? productSales : productSales.filter(product => product.category === activeCategory);
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <SalesHeader todayRevenue={todayRevenue} totalOrders={totalOrders} categories={getCategories()} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} onNavigateToOrders={navigateToOrders} />

        

        <BottomNav />
      </div>
    </div>;
};
export default Sales;