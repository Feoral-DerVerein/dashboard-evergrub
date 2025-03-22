
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EventOrder = {
  id: string;
  title: string;
  time: string;
  amount: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
};

interface OrderContextType {
  marketplaceOrders: EventOrder[];
  transferOrderToParcel: (order: EventOrder) => void;
  parcelOrders: EventOrder[];
  removeFromMarketplace: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketplaceOrders, setMarketplaceOrders] = useState<EventOrder[]>([
    {
      id: "1",
      title: "Corporate Lunch - Tech Co",
      time: "Today, 12:30 PM",
      amount: "$1,240",
      status: "Pending"
    },
    {
      id: "2",
      title: "Nightclub Event",
      time: "Tomorrow, 8:00 PM",
      amount: "$2,850",
      status: "Processing"
    }
  ]);
  
  const [parcelOrders, setParcelOrders] = useState<EventOrder[]>([]);
  
  // Load saved orders from localStorage on initial render
  useEffect(() => {
    const savedParcelOrders = localStorage.getItem('parcelOrders');
    if (savedParcelOrders) {
      setParcelOrders(JSON.parse(savedParcelOrders));
    }
    
    const savedMarketplaceOrders = localStorage.getItem('marketplaceOrders');
    if (savedMarketplaceOrders) {
      setMarketplaceOrders(JSON.parse(savedMarketplaceOrders));
    }
  }, []);
  
  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('parcelOrders', JSON.stringify(parcelOrders));
    localStorage.setItem('marketplaceOrders', JSON.stringify(marketplaceOrders));
  }, [parcelOrders, marketplaceOrders]);

  const transferOrderToParcel = (order: EventOrder) => {
    // Add order to parcel
    setParcelOrders(prevOrders => [...prevOrders, order]);
    
    // Remove from marketplace
    removeFromMarketplace(order.id);
    
    // Show success toast
    toast.success(`Order "${order.title}" transferred to Parcel`);
    
    // Optional: save to Supabase if needed
    // This is where you would add code to save to the database
  };

  const removeFromMarketplace = (orderId: string) => {
    setMarketplaceOrders(prevOrders => 
      prevOrders.filter(order => order.id !== orderId)
    );
  };

  return (
    <OrderContext.Provider value={{ 
      marketplaceOrders, 
      transferOrderToParcel, 
      parcelOrders,
      removeFromMarketplace
    }}>
      {children}
    </OrderContext.Provider>
  );
};
