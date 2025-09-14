import { useState, useCallback } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  cardType: 'inventory' | 'expiry' | 'sales' | 'recommendation' | 'alert' | 'analytics' | 'product-decision';
  cardData: any;
  createdAt: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  // Product decision specific fields
  product?: {
    id: number;
    name: string;
    quantity: number;
    expirationDate: string;
    category: string;
    price: number;
    image: string;
  };
  suggestedAction?: 'b2c-discount' | 'b2b-offer' | 'donate';
  actionTaken?: 'b2c-discount' | 'b2b-offer' | 'donate' | null;
}

const getSuggestedAction = (product: Task['product']): Task['suggestedAction'] => {
  if (!product) return 'donate';
  
  const daysUntilExpiry = Math.ceil((new Date(product.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const quantity = product.quantity;
  
  // Critical urgency (0-2 days)
  if (daysUntilExpiry <= 2) {
    if (quantity > 10) {
      return 'donate'; // High quantity, good for donation
    }
    return 'b2c-discount'; // Last resort for immediate sale
  }
  
  // High urgency (3-7 days)
  if (daysUntilExpiry <= 7) {
    if (quantity > 20) {
      return 'b2b-offer'; // High quantity, good for businesses
    }
    if (product.price > 20) {
      return 'b2c-discount'; // High value items
    }
    return 'donate';
  }
  
  // Medium urgency (8+ days)
  if (quantity > 50) {
    return 'b2b-offer'; // Bulk quantities
  }
  
  return 'b2c-discount'; // Default action
};

export const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((cardData: any, cardType: string, title: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium', product?: Task['product']) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      cardType: cardType as Task['cardType'],
      cardData,
      createdAt: new Date(),
      completed: false,
      priority,
      product,
      suggestedAction: product ? getSuggestedAction(product) : undefined,
      actionTaken: null
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  }, []);

  const addProductDecisionTask = useCallback((product: Task['product']) => {
    if (!product) return;
    
    const daysUntilExpiry = Math.ceil((new Date(product.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const title = `Decision required: ${product.name}`;
    const description = `${product.quantity} units expire in ${daysUntilExpiry} days`;
    
    return addTask(product, 'product-decision', title, description, daysUntilExpiry <= 2 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : 'medium', product);
  }, [addTask]);

  const takeAction = useCallback((taskId: string, action: Task['actionTaken']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, actionTaken: action, completed: true } : task
    ));
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => !task.completed));
  }, []);

  return {
    tasks,
    addTask,
    addProductDecisionTask,
    takeAction,
    completeTask,
    removeTask,
    clearCompletedTasks
  };
};