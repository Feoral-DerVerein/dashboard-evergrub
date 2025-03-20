
import { format } from "date-fns";
import { Receipt, ChevronRight } from "lucide-react";
import { Sale } from "@/services/salesService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface SaleCardProps {
  sale: Sale;
  onClick?: () => void;
}

const SaleCard = ({ sale, onClick }: SaleCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'CL';
  };

  const totalItems = sale.products ? sale.products.reduce((sum, product) => sum + product.quantity, 0) : 0;

  return (
    <Card 
      className="border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer mb-4"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-600 text-sm font-mono">
            #{sale.order_id.substring(0, 8)}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(sale.sale_date)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-green-100 text-green-600">
              <AvatarFallback>{getInitials(sale.customer_name)}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold">{sale.customer_name}</h3>
              <p className="text-gray-500 text-sm">{totalItems} items</p>
            </div>
          </div>

          <div className="flex items-center">
            <span className="font-bold text-xl mr-2">${Number(sale.amount).toFixed(2)}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SaleCard;
