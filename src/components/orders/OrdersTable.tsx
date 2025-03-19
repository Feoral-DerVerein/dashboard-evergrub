
import React, { useState, useEffect } from "react";
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
import { Eye, Check, X, CheckCircle2, Clock, XCircle } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, status: "accepted" | "completed" | "rejected") => void;
}

export function OrdersTable({ orders, onViewDetails, onStatusChange }: OrdersTableProps) {
  const [processingOrders, setProcessingOrders] = useState<Record<string, boolean>>({});
  
  const handleStatusChange = (orderId: string, status: "accepted" | "completed" | "rejected") => {
    setProcessingOrders({...processingOrders, [orderId]: true});
    
    setTimeout(() => {
      onStatusChange(orderId, status);
      
      setTimeout(() => {
        setProcessingOrders(prev => ({...prev, [orderId]: false}));
      }, 500);
    }, 100);
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "pending":
        return <Badge 
          variant="warning"
          icon={<Clock className="h-3 w-3" />}
        >
          Por aceptar
        </Badge>;
      case "accepted":
        return <Badge 
          variant="info"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Aceptado
        </Badge>;
      case "completed":
        return <Badge 
          variant="success"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Completado
        </Badge>;
      case "rejected":
        return <Badge 
          variant="destructive"
          icon={<XCircle className="h-3 w-3" />}
        >
          Rechazado
        </Badge>;
      default:
        return <Badge variant="outline">{order.status}</Badge>;
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50";
      case "completed":
        return "bg-green-50";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Recent Orders List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id} className={getRowClassName(order.status)}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.customerName || "Customer"}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewDetails(order)}
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
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingOrders[order.id]}
                          onClick={() => handleStatusChange(order.id, "rejected")}
                          title="Reject order"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === "accepted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={processingOrders[order.id]}
                        onClick={() => handleStatusChange(order.id, "completed")}
                        title="Mark as completed"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
