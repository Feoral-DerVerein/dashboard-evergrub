import { useEffect } from 'react';
import { useTaskList } from './useTaskList';
import { Product } from '@/services/productService';

interface AutoTaskGenerationProps {
  products: Product[];
}

export const useAutoTaskGeneration = ({ products }: AutoTaskGenerationProps) => {
  const { addTask } = useTaskList();

  useEffect(() => {
    if (!products || products.length === 0) return;

    // Auto-generate stock alerts tasks
    const stockAlerts = products.filter((p) => p.quantity > 0 && p.quantity <= 5);
    if (stockAlerts.length > 0) {
      stockAlerts.forEach(product => {
        addTask(
          { product, alertType: 'stock' },
          'alert',
          `Stock bajo: ${product.name}`,
          `Solo quedan ${product.quantity} unidades en inventario`,
          'high'
        );
      });
    }

    // Auto-generate expiring soon tasks
    const getExpiringProducts = () => {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      return products.filter(product => {
        if (!product.expirationDate) return false;
        const expiryDate = new Date(product.expirationDate);
        return expiryDate <= threeDaysFromNow && expiryDate >= today;
      });
    };

    const expiringProducts = getExpiringProducts();
    if (expiringProducts.length > 0) {
      expiringProducts.forEach(product => {
        const daysUntilExpiry = Math.ceil(
          (new Date(product.expirationDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        addTask(
          { product, alertType: 'expiry', daysUntilExpiry },
          'expiry',
          `Producto expirando: ${product.name}`,
          `Expira en ${daysUntilExpiry} días`,
          daysUntilExpiry <= 1 ? 'critical' : 'high'
        );
      });
    }

    // Auto-generate AI predictive insights task
    const totalProducts = products.length;
    const lowStockCount = stockAlerts.length;
    const expiringCount = expiringProducts.length;
    const avgStock = totalProducts > 0 ? products.reduce((sum, p) => sum + p.quantity, 0) / totalProducts : 0;
    
    if (totalProducts > 0) {
      addTask(
        { 
          totalProducts, 
          lowStockCount, 
          expiringCount, 
          avgStock,
          insights: {
            stockOptimization: lowStockCount > 0 ? 'Optimize stock levels' : 'Stock levels are adequate',
            wasteReduction: expiringCount > 0 ? 'Take action on expiring items' : 'No immediate waste concerns',
            demandForecast: `Average stock: ${Math.round(avgStock)} units`
          }
        },
        'analytics',
        'Análisis de inventario disponible',
        `${totalProducts} productos total, ${lowStockCount} con stock bajo, ${expiringCount} expirando pronto`,
        'medium'
      );
    }

  }, [products, addTask]);

  return { addTask };
};