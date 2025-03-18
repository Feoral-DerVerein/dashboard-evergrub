
import React from "react";
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
import { Eye, Check, X } from "lucide-react";
import { orderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onStatusChange: () => void;
}

export function OrdersTable({ orders, onViewDetails, onStatusChange }: OrdersTableProps) {
  const { toast } = useToast();
  
  const handleStatusChange = async (orderId: string, newStatus: "pending" | "accepted" | "completed" | "rejected") => {
    try {
      console.log(`Intentando cambiar el estado de la orden ${orderId} a ${newStatus}`);
      await orderService.updateOrderStatus(orderId, newStatus);
      
      let toastMessage = `El estado de la orden se cambió a ${newStatus}`;
      let toastTitle = "Orden actualizada";
      
      if (newStatus === "accepted") {
        toastTitle = "Orden Aceptada";
        toastMessage = "La orden fue aceptada y se envió una notificación al marketplace";
      } else if (newStatus === "completed") {
        toastTitle = "Orden Completada";
        toastMessage = "La orden ha sido marcada como completada";
      } else if (newStatus === "rejected") {
        toastTitle = "Orden Rechazada";
        toastMessage = "La orden ha sido rechazada";
      }
      
      toast({
        title: toastTitle,
        description: toastMessage,
      });
      
      onStatusChange();
    } catch (error) {
      console.error("Error al actualizar el estado de la orden:", error);
      
      // Mostrar un mensaje más específico según el error
      const errorMessage = error instanceof Error ? error.message : "No se pudo actualizar el estado de la orden";
      
      toast({
        title: "Error al actualizar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "accepted":
        return <Badge variant="info">Accepted</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                          onClick={() => handleStatusChange(order.id, "accepted")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
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
