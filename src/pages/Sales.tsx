import { useState, useEffect } from "react";
import { BarChart3, Receipt, DollarSign, Package, Calendar, CreditCard, List, ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesService, Sale } from "@/services/salesService";
import { format, parseISO } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const Sales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards">("cards");
  const [todaySales, setTodaySales] = useState({
    count: 0,
    total: 0
  });
  const [monthlySales, setMonthlySales] = useState({
    count: 0,
    total: 0
  });
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const fetchedSales = await salesService.getSales();
        setSales(fetchedSales);
        const todaySummary = await salesService.getTodaySales();
        setTodaySales(todaySummary);
        const monthlySummary = await salesService.getMonthlySales();
        setMonthlySales(monthlySummary);
      } catch (error) {
        console.error("Error fetching sales:", error);
        toast.error("Failed to load sales data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'CS';
  };
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  const StatCard = ({
    label,
    value,
    icon: Icon,
    trend = ''
  }) => <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1 text-left">{label}</p>
          <p className="text-lg font-bold">{value}</p>
          {trend && <p className="text-xs text-green-500 mt-1">↑ {trend}</p>}
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg shadow-sm py-[9px] px-[9px]">
          <Icon className="h-4 w-4 text-blue-700" />
        </div>
      </div>
    </Card>;
  const SaleCard = ({
    sale
  }: {
    sale: Sale;
  }) => <Card className="mb-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200 overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-100 text-blue-500">
              <AvatarFallback>{getInitials(sale.customer_name)}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-sm">{sale.customer_name}</h3>
              <p className="text-xs text-gray-500">
                Order #{sale.order_id?.substring(0, 8) || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <DollarSign className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(sale.sale_date)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="capitalize">{sale.payment_method || "Card"}</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-lg">${Number(sale.amount).toFixed(2)}</p>
            <p className="text-xs text-gray-500">{formatTime(sale.sale_date)}</p>
          </div>
        </div>
      </div>
    </Card>;
  return <>
      <header className="px-6 pt-8 pb-6 sticky top-0 glass-card z-10 border-b">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Sales</h1>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">
            {isLoading ? "Loading sales..." : `${sales.length} Sales`}
          </p>
        </div>
      </header>

      <main className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="Today Revenue" value={`$${todaySales.total.toFixed(2)}`} icon={DollarSign} trend="12.5%" />
          <StatCard label="Today Orders" value={todaySales.count} icon={Package} trend="8.3%" />
          <StatCard label="Monthly Revenue" value={`$${monthlySales.total.toFixed(2)}`} icon={BarChart3} trend="22.3%" />
          <StatCard label="Total Orders" value={sales.length} icon={Receipt} />
        </div>

        {isLoading ? <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div> : sales.length > 0 ? <div className="space-y-4">
            {sales.map(sale => <SaleCard key={sale.id} sale={sale} />)}
          </div> : <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">No sales found</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Completed orders will appear here as sales records.
            </p>
          </div>}
      </main>

      <BottomNav />
    </>;
};
export default Sales;