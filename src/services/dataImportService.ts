import { supabase } from "@/integrations/supabase/client";

export interface DataImportResult {
  success: boolean;
  message: string;
  dataType: 'products' | 'sales' | 'transactions' | 'unknown';
  recordsImported: number;
}

interface ProductRow {
  nombre?: string;
  name?: string;
  producto?: string;
  categoria?: string;
  category?: string;
  precio?: number;
  price?: string;
  cantidad?: number;
  quantity?: number;
  stock?: number;
  fecha_expiracion?: string;
  expiration_date?: string;
  expiry_date?: string;
  proveedor?: string;
  supplier?: string;
  costo?: number;
  cost?: number;
  [key: string]: any;
}

interface SalesRow {
  fecha?: string;
  date?: string;
  producto?: string;
  product?: string;
  name?: string;
  cantidad?: number;
  quantity?: number;
  monto?: number;
  amount?: number;
  total?: number;
  cliente?: string;
  customer?: string;
  customer_name?: string;
  categoria?: string;
  category?: string;
  [key: string]: any;
}

interface TransactionRow {
  fecha?: string;
  date?: string;
  tipo?: string;
  type?: string;
  descripcion?: string;
  description?: string;
  monto?: number;
  amount?: number;
  [key: string]: any;
}

/**
 * Convert Excel serial number to JavaScript Date
 * Excel dates are stored as days since 1900-01-01
 */
const excelSerialToDate = (serial: number): string => {
  // Excel's epoch starts at 1899-12-30 (accounting for Excel's 1900 leap year bug)
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dateMs = excelEpoch.getTime() + (serial * millisecondsPerDay);
  const date = new Date(dateMs);
  
  // Return in YYYY-MM-DD format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if a value is an Excel serial number and convert it
 */
const convertExcelDate = (value: any): string => {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // If it's already a proper date string, return it
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return value.split('T')[0];
  }
  
  // Check if it's an Excel serial number (numeric value > 1000)
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  if (!isNaN(numValue) && numValue > 1000 && numValue < 100000) {
    console.log(`🔄 Converting Excel date ${value} to proper date`);
    return excelSerialToDate(numValue);
  }
  
  // Try to parse as date
  const parsedDate = new Date(value);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  
  // Default to today
  return new Date().toISOString().split('T')[0];
};

// Normalize column names to lowercase for comparison
const normalizeKeys = (data: any[]): any[] => {
  return data.map(row => {
    const normalized: any = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
      normalized[normalizedKey] = row[key];
    });
    return normalized;
  });
};

// Detect data type based on column names
const detectDataType = (data: any[]): 'products' | 'sales' | 'transactions' | 'unknown' => {
  if (data.length === 0) return 'unknown';
  
  const firstRow = data[0];
  const keys = Object.keys(firstRow).map(k => k.toLowerCase());
  
  console.log('🔍 Detecting data type. Column headers:', keys);
  
  // Check for product columns
  const productIndicators = ['producto', 'product', 'nombre', 'name', 'categoria', 'category', 'stock', 'cantidad', 'quantity', 'precio', 'price', 'expiracion', 'expiration', 'expiry', 'item'];
  const productScore = productIndicators.filter(ind => keys.some(k => k.includes(ind))).length;
  
  // Check for sales columns
  const salesIndicators = ['venta', 'sale', 'fecha', 'date', 'cliente', 'customer', 'total', 'monto', 'amount'];
  const salesScore = salesIndicators.filter(ind => keys.some(k => k.includes(ind))).length;
  
  // Check for transaction columns
  const transactionIndicators = ['transaccion', 'transaction', 'tipo', 'type', 'descripcion', 'description'];
  const transactionScore = transactionIndicators.filter(ind => keys.some(k => k.includes(ind))).length;
  
  console.log('📊 Scores - Products:', productScore, 'Sales:', salesScore, 'Transactions:', transactionScore);
  
  // Return the type with highest score
  if (productScore >= salesScore && productScore >= transactionScore && productScore > 2) {
    console.log('✅ Detected as PRODUCTS');
    return 'products';
  } else if (salesScore >= transactionScore && salesScore > 2) {
    console.log('✅ Detected as SALES');
    return 'sales';
  } else if (transactionScore > 1) {
    console.log('✅ Detected as TRANSACTIONS');
    return 'transactions';
  }
  
  console.log('⚠️ Could not detect data type (unknown)');
  return 'unknown';
};

// Import products
const importProducts = async (data: ProductRow[], userId: string): Promise<number> => {
  console.log(`📦 Starting product import for user ${userId}, ${data.length} rows`);
  let imported = 0;
  
  for (const row of data) {
    try {
      const productName = row.nombre || row.name || row.producto || row.item || '';
      if (!productName) {
        console.log('⚠️ Skipping row without product name:', row);
        continue;
      }
      
      // Get expiration date and convert if it's an Excel serial number
      const rawExpirationDate = row.fecha_expiracion || 
                                row.expiration_date || 
                                row.expiry_date || 
                                row.expirationdate ||
                                row.expire_date ||
                                row.best_before_date;
      
      const expirationDate = convertExcelDate(rawExpirationDate);
      
      const productData = {
        name: productName,
        category: row.categoria || row.category || 'General',
        price: parseFloat(String(row.precio || row.price || 0)),
        quantity: parseInt(String(row.cantidad || row.quantity || row.stock || 0)),
        expirationdate: expirationDate,
        description: row.descripcion || row.description || '',
        brand: row.proveedor || row.supplier || row.marca || row.brand || '',
        image: '',
        userid: userId,
        status: 'active',
        discount: 0,
        is_marketplace_visible: true
      };
      
      console.log('📝 Inserting product:', productData.name);
      
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (!error) {
        imported++;
        console.log(`✅ Product imported: ${productData.name}`);
      } else {
        console.error('❌ Error importing product:', productName, error);
      }
    } catch (error) {
      console.error('❌ Error processing product row:', error);
    }
  }
  
  console.log(`✅ Import complete: ${imported} products imported`);
  return imported;
};

// Calculate and update metrics after import
const updateSalesMetrics = async (userId: string, salesData: SalesRow[]) => {
  try {
    // Calculate totals from imported data
    const totalSales = salesData.reduce((sum, row) => {
      const amount = parseFloat(String(row.monto || row.amount || row.total || 0));
      return sum + amount;
    }, 0);

    const transactions = salesData.length;
    
    // Estimate profit as 30% of sales (adjust based on your business)
    const profit = totalSales * 0.30;

    const today = new Date().toISOString().split('T')[0];

    // Upsert sales metrics
    const { error: salesMetricsError } = await supabase
      .from('sales_metrics')
      .upsert({
        user_id: userId,
        date: today,
        total_sales: totalSales,
        transactions: transactions,
        profit: profit
      }, {
        onConflict: 'user_id,date'
      });

    if (salesMetricsError) {
      console.error('Error updating sales metrics:', salesMetricsError);
    }

    // Calculate customer metrics
    const avgOrderValue = transactions > 0 ? totalSales / transactions : 0;
    const conversionRate = 15.5; // Default estimate
    const returnRate = 2.3; // Default estimate

    const { error: customerMetricsError } = await supabase
      .from('customer_metrics')
      .upsert({
        user_id: userId,
        date: today,
        avg_order_value: avgOrderValue,
        conversion_rate: conversionRate,
        return_rate: returnRate
      }, {
        onConflict: 'user_id,date'
      });

    if (customerMetricsError) {
      console.error('Error updating customer metrics:', customerMetricsError);
    }

    console.log('✅ Metrics updated:', {
      totalSales,
      transactions,
      profit,
      avgOrderValue
    });
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
};

// Import sales
const importSales = async (data: SalesRow[], userId: string): Promise<number> => {
  let imported = 0;
  
  // Group sales by date and customer
  const salesGroups: Map<string, SalesRow[]> = new Map();
  
  data.forEach(row => {
    const date = row.fecha || row.date || new Date().toISOString();
    const customer = row.cliente || row.customer || row.customer_name || 'Unknown';
    const key = `${date}-${customer}`;
    
    if (!salesGroups.has(key)) {
      salesGroups.set(key, []);
    }
    salesGroups.get(key)!.push(row);
  });
  
  // Create orders and sales for each group
  for (const [key, items] of salesGroups) {
    try {
      const [dateStr, customerName] = key.split('-');
      const total = items.reduce((sum, item) => {
        return sum + parseFloat(String(item.monto || item.amount || item.total || 0));
      }, 0);
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerName,
          total: total,
          status: 'completed',
          user_id: userId,
          timestamp: dateStr,
          from_orders_page: false
        }])
        .select()
        .single();
      
      if (orderError || !orderData) {
        console.error('Error creating order:', orderError);
        continue;
      }
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        name: item.producto || item.product || item.name || 'Unknown',
        quantity: parseInt(String(item.cantidad || item.quantity || 1)),
        price: parseFloat(String(item.monto || item.amount || item.total || 0)),
        category: item.categoria || item.category || null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        continue;
      }
      
      // Create sale record
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          order_id: orderData.id,
          amount: total,
          customer_name: customerName,
          sale_date: dateStr,
          products: orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            category: item.category
          })),
          payment_method: 'card'
        }]);
      
      if (!saleError) {
        imported++;
      } else {
        console.error('Error creating sale:', saleError);
      }
    } catch (error) {
      console.error('Error processing sales group:', error);
    }
  }
  
  // Update metrics tables after import
  if (imported > 0) {
    await updateSalesMetrics(userId, data);
  }
  
  return imported;
};

// Import transactions (grain transactions)
const importTransactions = async (data: TransactionRow[], userId: string): Promise<number> => {
  let imported = 0;
  
  // Map Spanish transaction types to database types
  const mapTransactionType = (tipo: string): 'earned' | 'redeemed' | 'purchased_with' => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('ingreso') || tipoLower.includes('earn')) {
      return 'earned';
    } else if (tipoLower.includes('egreso') || tipoLower.includes('gasto') || tipoLower.includes('redeem')) {
      return 'redeemed';
    } else if (tipoLower.includes('compra') || tipoLower.includes('purchase')) {
      return 'purchased_with';
    }
    return 'earned'; // Default
  };
  
  for (const row of data) {
    try {
      const amount = parseInt(String(row.monto || row.amount || 0));
      if (!amount) continue;
      
      const rawType = row.tipo || row.type || 'earned';
      const transactionData = {
        user_id: userId,
        type: mapTransactionType(String(rawType)),
        amount: Math.abs(amount),
        description: row.descripcion || row.description || 'Imported transaction',
        cash_value: 0
      };
      
      const { error } = await supabase
        .from('grain_transactions')
        .insert([transactionData]);
      
      if (!error) {
        imported++;
      } else {
        console.error('Error importing transaction:', error);
      }
    } catch (error) {
      console.error('Error processing transaction row:', error);
    }
  }
  
  return imported;
};

export const dataImportService = {
  async processImportedData(jsonData: any[], userId: string): Promise<DataImportResult> {
    try {
      // Normalize data
      const normalizedData = normalizeKeys(jsonData);
      
      // Detect data type
      const dataType = detectDataType(normalizedData);
      
      if (dataType === 'unknown') {
        return {
          success: false,
          message: 'Could not detect data type. Make sure your file has proper column headers.',
          dataType: 'unknown',
          recordsImported: 0
        };
      }
      
      let recordsImported = 0;
      
      // Import based on detected type
      switch (dataType) {
        case 'products':
          recordsImported = await importProducts(normalizedData, userId);
          break;
        case 'sales':
          recordsImported = await importSales(normalizedData, userId);
          break;
        case 'transactions':
          recordsImported = await importTransactions(normalizedData, userId);
          break;
      }
      
      return {
        success: recordsImported > 0,
        message: `Successfully imported ${recordsImported} ${dataType} records`,
        dataType,
        recordsImported
      };
    } catch (error) {
      console.error('Error processing imported data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        dataType: 'unknown',
        recordsImported: 0
      };
    }
  }
};
