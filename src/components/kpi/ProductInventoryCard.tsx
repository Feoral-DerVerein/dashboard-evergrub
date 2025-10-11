import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, RefreshCw, AlertTriangle, Loader2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, differenceInDays, parseISO, isValid } from "date-fns";

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  expirationdate: string | null;
  category: string;
  brand: string;
}

interface POSConnection {
  id: string;
  last_sync_at: string | null;
  pos_type: string;
}

export const ProductInventoryCard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchLastSync();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, categoryFilter, stockFilter, expiryFilter]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, quantity, expirationdate, category, brand')
        .eq('userid', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set((data || []).map(p => p.category).filter(Boolean)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSync = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pos_connections')
        .select('id, last_sync_at, pos_type')
        .eq('user_id', user.id)
        .eq('connection_status', 'active')
        .order('last_sync_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLastSync(data.last_sync_at);
      }
    } catch (error) {
      console.error('Error fetching last sync:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-square-products');

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Successfully synced ${data.synced} products from Square`);
      await fetchProducts();
      await fetchLastSync();
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync products');
    } finally {
      setSyncing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(p => p.quantity < 10);
    }

    // Expiry filter
    if (expiryFilter === "expiring") {
      filtered = filtered.filter(p => {
        const daysToExpiry = getDaysToExpiry(p.expirationdate);
        return daysToExpiry !== null && daysToExpiry <= 7;
      });
    }

    setFilteredProducts(filtered);
  };

  const getDaysToExpiry = (expirationDate: string | null): number | null => {
    if (!expirationDate) return null;

    try {
      // Try parsing as ISO date first
      let date = parseISO(expirationDate);
      
      // If not valid, try extracting date from description format "Expira: YYYY-MM-DD"
      if (!isValid(date)) {
        const match = expirationDate.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
          date = parseISO(match[1]);
        }
      }

      if (isValid(date)) {
        return differenceInDays(date, new Date());
      }
    } catch (error) {
      console.error('Error parsing expiration date:', error);
    }

    return null;
  };

  const getExpiryStatus = (expirationDate: string | null): { label: string; color: string } => {
    const days = getDaysToExpiry(expirationDate);

    if (days === null) {
      return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
    }

    if (days < 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800' };
    } else if (days <= 3) {
      return { label: `${days}d left`, color: 'bg-red-100 text-red-800' };
    } else if (days <= 7) {
      return { label: `${days}d left`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: `${days}d left`, color: 'bg-green-100 text-green-800' };
    }
  };

  const formatLastSync = (lastSyncAt: string | null): string => {
    if (!lastSyncAt) return 'Never synced';

    try {
      const syncDate = parseISO(lastSyncAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / 60000);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
      return format(syncDate, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle>Product Inventory</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Last sync: {formatLastSync(lastSync)}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Expiry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock (&lt;10)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products synced yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Square account and click Sync Now to import your products.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Now
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const expiryStatus = getExpiryStatus(product.expirationdate);
                  const stockAlert = product.quantity < 10;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{product.name}</div>
                          {product.brand && (
                            <div className="text-xs text-muted-foreground">{product.brand}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{product.sku || 'N/A'}</span>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {stockAlert && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          <span className={stockAlert ? 'text-orange-600 font-medium' : ''}>
                            {product.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.expirationdate ? (
                          <span className="text-sm">
                            {getDaysToExpiry(product.expirationdate) !== null
                              ? format(
                                  parseISO(
                                    product.expirationdate.match(/(\d{4}-\d{2}-\d{2})/)
                                      ? product.expirationdate.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || product.expirationdate
                                      : product.expirationdate
                                  ),
                                  'MMM dd, yyyy'
                                )
                              : 'Invalid date'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>
              Total Products: <span className="font-medium text-foreground">{filteredProducts.length}</span>
            </div>
            <div>
              Low Stock: <span className="font-medium text-orange-600">
                {filteredProducts.filter(p => p.quantity < 10).length}
              </span>
            </div>
            <div>
              Expiring Soon: <span className="font-medium text-red-600">
                {filteredProducts.filter(p => {
                  const days = getDaysToExpiry(p.expirationdate);
                  return days !== null && days <= 7;
                }).length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
