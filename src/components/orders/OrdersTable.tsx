
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
    onStatusChange(orderId, status);
    // We don't set processing to false because the parent component will refresh the order list
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "pending":
        return <Badge 
          variant="warning"
          icon={<Clock className="h-3 w-3" />}
        >
          Pending
        </Badge>;
      case "accepted":
        return <Badge 
          variant="info"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Accepted
        </Badge>;
      case "completed":
        return <Badge 
          variant="success"
          icon={<CheckCircle2 className="h-3 w-3" />}
        >
          Completed
        </Badge>;
      case "rejected":
        return <Badge 
          variant="destructive"
          icon={<XCircle className="h-3 w-3" />}
        >
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{order.status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Lista de órdenes recientes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID de Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Artículos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                <TableCell>{order.customerName || "Cliente"}</TableCell>
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
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingOrders[order.id]}
                          onClick={() => handleStatusChange(order.id, "rejected")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === "accepted" && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={processingOrders[order.id]}
                        onClick={() => handleStatusChange(order.id, "completed")}
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
                No se encontraron órdenes
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
