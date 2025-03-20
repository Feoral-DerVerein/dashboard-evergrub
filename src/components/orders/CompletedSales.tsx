
import React from "react";
import { Order } from "@/types/order.types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, DollarSign, Package, BarChart } from "lucide-react";
import { OrdersTable } from "./OrdersTable";

interface CompletedSalesProps {
  completedOrders: Order[];
  viewMode: "cards" | "table";
  onViewDetails: (order: Order) => void;
  isLoading: boolean;
}

export function CompletedSales({ completedOrders, viewMode, onViewDetails, isLoading }: CompletedSalesProps) {
  // Calculate total revenue from completed orders
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  
  const CompletedSaleCard = ({ order }: { order: Order }) => {
    const getInitials = (name: string) => {
      return name ? name.substr(0, 2).toUpperCase() : 'CN';
    };
    
    const formatTime = (timestamp: string) => {
      try {
        return timestamp;
      } catch (error) {
        return "";
      }
    };
    
    return (
      <Card className="mb-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200 overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-600 font-mono">
              {order.id.substring(0, 8)}
            </div>
            <div className="font-medium text-emerald-500 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-emerald-100 text-emerald-500">
                <AvatarFallback>{getInitials(order.customerName)}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-bold text-xs">{order.customerName}</h3>
                <p className="text-gray-500">{order.items.length} items</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="font-bold text-xl">${order.total.toFixed(2)}</div>
              <div className="text-gray-500">{formatTime(order.timestamp)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-gray-100">
          <Button variant="ghost" className="flex-1 rounded-none h-12 hover:bg-gray-50" onClick={() => onViewDetails(order)}>
            <Eye className="h-5 w-5 text-blue-500" />
          </Button>
        </div>
      </Card>
    );
  };
  
  if (completedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium mb-2">No completed sales yet</p>
        <p className="text-gray-400 text-sm max-w-xs">
          Completed sales will appear here after you fulfill orders.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 mt-2 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart className="h-6 w-6 text-emerald-600 mr-2" />
            <div>
              <h3 className="font-bold text-emerald-700">Total Sales</h3>
              <p className="text-gray-500 text-sm">{completedOrders.length} orders completed</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <div className="space-y-4">
          {completedOrders.map(order => (
            <CompletedSaleCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <OrdersTable 
          orders={completedOrders} 
          onViewDetails={onViewDetails} 
          onStatusChange={() => {}} 
        />
      )}
    </div>
  );
}
