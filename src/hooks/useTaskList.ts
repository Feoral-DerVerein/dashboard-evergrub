import { useState, useCallback } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  cardType: 'inventory' | 'expiry' | 'sales' | 'recommendation' | 'alert' | 'analytics';
  cardData: any;
  createdAt: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((cardData: any, cardType: string, title: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      cardType: cardType as Task['cardType'],
      cardData,
      createdAt: new Date(),
      completed: false,
      priority
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
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
    completeTask,
    removeTask,
    clearCompletedTasks
  };
};