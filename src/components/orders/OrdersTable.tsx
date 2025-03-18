
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
import { Eye, Check, X, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onStatusChange: () => void;
}

export function OrdersTable({ orders, onViewDetails, onStatusChange }: OrdersTableProps) {
  const { toast } = useToast();
  const [loadingOrderIds, setLoadingOrderIds] = useState<string[]>([]);
  
  const handleStatusChange = async (orderId: string, newStatus: "pending" | "accepted" | "completed" | "rejected") => {
    try {
      setLoadingOrderIds(prev => [...prev, orderId]);
      
      if (newStatus === "rejected") {
        // Eliminar la orden en lugar de cambiar su estado
        console.log(`Eliminando la orden ${orderId}`);
        await orderService.deleteOrder(orderId);
        
        toast({
          title: "Orden Eliminada",
          description: "La orden ha sido eliminada correctamente",
        });
      } else {
        // Actualizar el estado para los otros casos
        console.log(`Cambiando el estado de la orden ${orderId} a ${newStatus}`);
        await orderService.updateOrderStatus(orderId, newStatus);
        
        let toastMessage = `El estado de la orden se cambió a ${newStatus}`;
        let toastTitle = "Orden actualizada";
        
        if (newStatus === "accepted") {
          toastTitle = "Orden Aceptada";
          toastMessage = "La orden fue aceptada y se envió una notificación al marketplace";
          
          try {
            await notificationService.createOrderNotification(
              orderId,
              `La orden #${orderId.substring(0, 8)} está siendo procesada`
            );
            console.log(`Notificación de procesamiento creada para la orden ${orderId}`);
          } catch (notifError) {
            console.error(`Error al crear la notificación de procesamiento para la orden ${orderId}:`, notifError);
          }
        } else if (newStatus === "completed") {
          toastTitle = "Orden Completada";
          toastMessage = "La orden ha sido marcada como completada";
        }
        
        toast({
          title: toastTitle,
          description: toastMessage,
        });
      }
      
      // Importante: llamar a onStatusChange para actualizar la lista de órdenes
      onStatusChange();
    } catch (error) {
      console.error("Error al procesar la orden:", error);
      
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar la orden";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
                <TableCell>{order.customerName || "Cliente"}</TableCell>
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
                          disabled={loadingOrderIds.includes(order.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(order.id, "rejected")}
                          disabled={loadingOrderIds.includes(order.id)}
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
                        disabled={loadingOrderIds.includes(order.id)}
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
