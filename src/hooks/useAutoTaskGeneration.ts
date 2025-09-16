import { useEffect, useRef } from 'react';
import { useTaskList } from './useTaskList';
import { Product } from '@/services/productService';

interface AutoTaskGenerationProps {
  products: Product[];
}

export const useAutoTaskGeneration = ({ products }: AutoTaskGenerationProps) => {
  const { addTask, tasks } = useTaskList();
  const lastGeneratedRef = useRef<string>('');

  useEffect(() => {
    if (!products || products.length === 0) return;

    // Create a unique signature for current products to avoid duplicate generation
    const productsSignature = JSON.stringify(products.map(p => ({ id: p.id, quantity: p.quantity, expirationDate: p.expirationDate })));
    
    // Only generate if products have changed
    if (lastGeneratedRef.current === productsSignature) return;
    lastGeneratedRef.current = productsSignature;

    console.log('Auto-generating tasks for', products.length, 'products');

    // Excluded products that should not generate auto tasks (already managed)
    const excludedProducts = ['Red apples', 'Manzanas rojas'];

    // Auto-generate stock alerts tasks
    const stockAlerts = products.filter((p) => 
      p.quantity > 0 && 
      p.quantity <= 5 && 
      !excludedProducts.includes(p.name)
    );
    console.log('Found', stockAlerts.length, 'stock alerts');
    
    if (stockAlerts.length > 0) {
      stockAlerts.forEach(product => {
        const taskId = addTask(
          { product, alertType: 'stock' },
          'alert',
          `🚨 Stock bajo: ${product.name}`,
          `Solo quedan ${product.quantity} unidades en inventario`,
          'high'
        );
        console.log('Added stock alert task:', taskId);
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

    const expiringProducts = getExpiringProducts().filter(product => 
      !excludedProducts.includes(product.name)
    );
    console.log('Found', expiringProducts.length, 'expiring products');
    
    if (expiringProducts.length > 0) {
      expiringProducts.forEach(product => {
        const daysUntilExpiry = Math.ceil(
          (new Date(product.expirationDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const taskId = addTask(
          { product, alertType: 'expiry', daysUntilExpiry },
          'expiry',
          `⏰ Producto expirando: ${product.name}`,
          `Expira en ${daysUntilExpiry} días`,
          daysUntilExpiry <= 1 ? 'critical' : 'high'
        );
        console.log('Added expiry task:', taskId);
      });
    }

    // Auto-generate AI predictive insights task
    const totalProducts = products.length;
    const lowStockCount = stockAlerts.length;
    const expiringCount = expiringProducts.length;
    const avgStock = totalProducts > 0 ? products.reduce((sum, p) => sum + p.quantity, 0) / totalProducts : 0;
    
    if (totalProducts > 0) {
      const taskId = addTask(
        { 
          totalProducts, 
          lowStockCount, 
          expiringCount, 
          avgStock,
          insights: {
            stockOptimization: lowStockCount > 0 ? 'Optimizar niveles de stock' : 'Niveles de stock adecuados',
            wasteReduction: expiringCount > 0 ? 'Tomar acción en productos que expiran' : 'Sin preocupaciones inmediatas de desperdicio',
            demandForecast: `Stock promedio: ${Math.round(avgStock)} unidades`
          }
        },
        'analytics',
        '🤖 Análisis de inventario disponible',
        `${totalProducts} productos total, ${lowStockCount} con stock bajo, ${expiringCount} expirando pronto`,
        'medium'
      );
      console.log('Added analytics task:', taskId);
    }

    console.log('Task generation completed. Current tasks count:', tasks.length);

  }, [products, addTask, tasks.length]);

  return { addTask };
};