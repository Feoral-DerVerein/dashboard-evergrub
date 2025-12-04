import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertTriangle, Package, ArrowUpRight } from 'lucide-react';
import { enterpriseService } from '@/services/enterpriseService';
import { toast } from 'sonner';

const InventoryEnterprise = () => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await enterpriseService.getInventory();
            setInventory(data || []);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleStockUpdate = async (productId: string, currentStock: number, change: number) => {
        try {
            const newStock = Math.max(0, currentStock + change);
            await enterpriseService.updateInventory(productId, { current_stock: newStock });

            // Optimistic update
            setInventory(prev => prev.map(item =>
                item.product_id === productId
                    ? { ...item, current_stock: newStock }
                    : item
            ));

            toast.success("Stock updated");
        } catch (error) {
            toast.error("Failed to update stock");
            fetchInventory(); // Revert on error
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.products?.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Enterprise Inventory</h1>
                    <p className="text-gray-600">Advanced stock management and tracking</p>
                </div>
                <Button onClick={fetchInventory} variant="outline">
                    Refresh Data
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Inventory Overview</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-8 w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock Level</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading inventory...</TableCell>
                                </TableRow>
                            ) : filteredInventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">No products found</TableCell>
                                </TableRow>
                            ) : (
                                filteredInventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                {item.products?.name || 'Unknown Product'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{item.products?.category || 'Uncategorized'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{item.current_stock}</span>
                                                <span className="text-xs text-gray-500">
                                                    (Min: {item.min_stock} / Max: {item.max_stock})
                                                </span>
                                            </div>
                                            {/* Progress bar for stock level */}
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.current_stock < item.min_stock ? 'bg-red-500' :
                                                            item.current_stock > item.max_stock ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (item.current_stock / item.max_stock) * 100)}%` }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.current_stock < item.min_stock ? (
                                                <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" /> Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                    Optimal
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            ${((item.current_stock || 0) * (item.products?.price || 0)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStockUpdate(item.product_id, item.current_stock, -1)}
                                                >
                                                    -
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStockUpdate(item.product_id, item.current_stock, 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryEnterprise;
