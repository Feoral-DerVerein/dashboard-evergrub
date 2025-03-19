
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/order.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, CheckCircle2, Clock, XCircle, Trash2, Package } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, status: "accepted" | "completed" | "rejected") => void;
  onDelete?: (orderId: string) => void;
}

export function OrdersTable({ orders, onViewDetails, onStatusChange, onDelete }: OrdersTableProps) {
  const [processingOrders, setProcessingOrders] = useState<Record<string, boolean>>({});
  
  const handleStatusChange = (orderId: string, status: "accepted" | "completed" | "rejected") => {
    // Mark this specific order as processing
    setProcessingOrders(prev => ({...prev, [orderId]: true}));
    
    // Call the status change handler
    onStatusChange(orderId, status);
    
    // Reset the processing state after a short delay
    setTimeout(() => {
      setProcessingOrders(prev => {
        const newState = {...prev};
        delete newState[orderId]; // Only remove this specific order from processing
        return newState;
      });
    }, 500);
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "pending":
        return <Badge 
          variant="warning"
          className="bg-amber-100 text-amber-800 font-medium"
          icon={<Clock className="h-3 w-3" />}
        >
          Pending
        </Badge>;
      case "accepted":
        return <Badge 
          variant="info"
          className="bg-blue-100 text-blue-800 font-medium"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Accepted
        </Badge>;
      case "completed":
        return <Badge 
          variant="success"
          className="bg-emerald-100 text-emerald-800 font-medium"
          icon={<Package className="h-3 w-3" />}
        >
          Completed
        </Badge>;
      case "rejected":
        return <Badge 
          variant="destructive"
          className="bg-red-100 text-red-800 font-medium"
          icon={<XCircle className="h-3 w-3" />}
        >
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{order.status}</Badge>;
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-blue-50";
      case "completed":
        return "bg-emerald-50";
      case "rejected":
        return "bg-red-50/30";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableCaption className="pb-4">Recent Orders List</TableCaption>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Order ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Items</TableHead>
            <TableHead className="font-semibold">Total</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id} className={getRowClassName(order.status)}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.customerName || "Customer"}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(order)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {order.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={processingOrders[order.id]}
                          onClick={() => handleStatusChange(order.id, "accepted")}
                          title="Accept order"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingOrders[order.id]}
                          onClick={() => handleStatusChange(order.id, "rejected")}
                          title="Reject order"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === "accepted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={processingOrders[order.id]}
                        onClick={() => handleStatusChange(order.id, "completed")}
                        title="Mark as completed"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={processingOrders[order.id]}
                        onClick={() => onDelete(order.id)}
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Package className="h-12 w-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">No orders found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
