
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

  const filteredProducts = activeCategory === "All" 
    ? productSales 
    : productSales.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen animate-fade-in pb-20">
        <SalesHeader
          todayRevenue={todayRevenue}
          totalOrders={totalOrders}
          categories={getCategories()}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onNavigateToOrders={navigateToOrders}
        />

        <main className="px-6">
          {newAcceptedOrderId && !newOrdersPageAccepted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-pulse">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">New order accepted!</p>
                  <p className="text-sm">Sales data has been updated.</p>
                </div>
              </div>
            </div>
          )}
          
          <SalesAlerts
            newOrdersPageAccepted={newOrdersPageAccepted}
            newMarketplaceCompletedOrder={newMarketplaceCompletedOrder}
            newCompletedOrderId={newCompletedOrderId}
            newCompletedOrderAmount={newCompletedOrderAmount}
            onNavigateToOrders={navigateToOrders}
          />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Sales</h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
          </div>
          
          <ProductList products={filteredProducts} isLoading={isLoading} />

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 shadow-md" 
            onClick={navigateToOrders}
          >
            <ShoppingBag className="w-5 h-5" />
            View Orders
          </Button>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Sales;
