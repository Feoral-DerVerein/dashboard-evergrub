import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load saved orders from localStorage on initial render
  useEffect(() => {
    const savedMarketplaceOrders = localStorage.getItem('marketplaceOrders');
    if (savedMarketplaceOrders) {
      setMarketplaceOrders(JSON.parse(savedMarketplaceOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('marketplaceOrders', JSON.stringify(marketplaceOrders));
  }, [marketplaceOrders]);

  const removeFromMarketplace = (orderId: string) => {
    setMarketplaceOrders(prevOrders =>
      prevOrders.filter(order => order.id !== orderId)
    );
  };

  return (
    <OrderContext.Provider value={{
      marketplaceOrders,
      removeFromMarketplace
    }}>
      {children}
    </OrderContext.Provider>
  );
};
