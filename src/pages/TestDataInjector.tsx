/**
 * Test Data Injector Page
 * 
 * Admin page to inject test data into the dashboard for testing purposes.
 * Only accessible in development mode.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
    injectCompleteTestData,
    clearTestData,
    injectTestSales,
    injectTestProducts,
} from '@/utils/seedDashboardData';
import { Database, Trash2, ArrowLeft, Loader2, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestDataInjector = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isInjecting, setIsInjecting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const [config, setConfig] = useState({
        salesCount: 50,
        productsCount: 30,
        daysBack: 30,
    });

    const [lastResult, setLastResult] = useState<any>(null);

    // Only allow in development
    const isDevelopment = import.meta.env.DEV;

    if (!isDevelopment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                        <CardDescription>
                            This page is only available in development mode.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleInjectAllData = async () => {
        if (!user?.id) {
            toast.error('No user logged in');
            return;
        }

        setIsInjecting(true);
        setLastResult(null);

        try {
            toast.info('Injecting test data...', {
                description: 'This may take a few moments',
            });

            const result = await injectCompleteTestData(user.id, config);

            setLastResult(result);

            if (result.success) {
                toast.success('Test data injected successfully!', {
                    description: result.message,
                });
            } else {
                toast.error('Failed to inject some data', {
                    description: result.message,
                });
            }
        } catch (error) {
            console.error('Error injecting data:', error);
            toast.error('Error injecting test data', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setIsInjecting(false);
        }
    };

    const handleInjectSalesOnly = async () => {
        if (!user?.id) {
            toast.error('No user logged in');
            return;
        }

        setIsInjecting(true);

        try {
            const result = await injectTestSales(user.id, config.salesCount, config.daysBack);

            if (result.success) {
                toast.success(`Injected ${result.count} sales`);
            } else {
                toast.error('Failed to inject sales', {
                    description: result.message,
                });
            }
        } catch (error) {
            toast.error('Error injecting sales');
        } finally {
            setIsInjecting(false);
        }
    };

    const handleInjectProductsOnly = async () => {
        if (!user?.id) {
            toast.error('No user logged in');
            return;
        }

        setIsInjecting(true);

        try {
            const result = await injectTestProducts(user.id, config.productsCount);

            if (result.success) {
                toast.success(`Injected ${result.count} products`);
            } else {
                toast.error('Failed to inject products', {
                    description: result.message,
                });
            }
        } catch (error) {
            toast.error('Error injecting products');
        } finally {
            setIsInjecting(false);
        }
    };

    const handleClearData = async () => {
        if (!user?.id) {
            toast.error('No user logged in');
            return;
        }

        if (!confirm('Are you sure you want to clear ALL test data? This cannot be undone.')) {
            return;
        }

        setIsClearing(true);
        setLastResult(null);

        try {
            toast.info('Clearing test data...');

            const result = await clearTestData(user.id);

            if (result.success) {
                toast.success('Test data cleared successfully');
            } else {
                toast.error('Failed to clear data', {
                    description: result.message,
                });
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            toast.error('Error clearing test data');
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Test Data Injector</h1>
                        <p className="text-gray-600 mt-1">Generate and inject realistic test data for dashboard testing</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>

                {/* Warning Alert */}
                <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Development Mode Only.</strong> This page allows you to inject test data
                        to verify the dashboard functionality. All data is scoped to your user account.
                    </AlertDescription>
                </Alert>

                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Configuration</CardTitle>
                        <CardDescription>
                            Configure the amount and timeframe of test data to generate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salesCount">Number of Sales</Label>
                                <Input
                                    id="salesCount"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={config.salesCount}
                                    onChange={(e) => setConfig({ ...config, salesCount: parseInt(e.target.value) || 0 })}
                                    disabled={isInjecting || isClearing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="productsCount">Number of Products</Label>
                                <Input
                                    id="productsCount"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={config.productsCount}
                                    onChange={(e) => setConfig({ ...config, productsCount: parseInt(e.target.value) || 0 })}
                                    disabled={isInjecting || isClearing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="daysBack">Days of History</Label>
                                <Input
                                    id="daysBack"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={config.daysBack}
                                    onChange={(e) => setConfig({ ...config, daysBack: parseInt(e.target.value) || 0 })}
                                    disabled={isInjecting || isClearing}
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                onClick={handleInjectAllData}
                                disabled={isInjecting || isClearing}
                                className="w-full"
                                size="lg"
                            >
                                {isInjecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Injecting Data...
                                    </>
                                ) : (
                                    <>
                                        <Database className="mr-2 h-4 w-4" />
                                        Inject Complete Dataset
                                    </>
                                )}
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleInjectSalesOnly}
                                    disabled={isInjecting || isClearing}
                                    variant="outline"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Sales Only
                                </Button>

                                <Button
                                    onClick={handleInjectProductsOnly}
                                    disabled={isInjecting || isClearing}
                                    variant="outline"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Products Only
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                {lastResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className={lastResult.success ? 'text-green-600' : 'text-red-600'}>
                                {lastResult.success ? 'Success!' : 'Failed'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-gray-700">{lastResult.message}</p>
                                {lastResult.sales && (
                                    <p className="text-sm text-gray-600">
                                        Sales: {lastResult.sales.count} records
                                    </p>
                                )}
                                {lastResult.products && (
                                    <p className="text-sm text-gray-600">
                                        Products: {lastResult.products.count} records
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Danger Zone */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions - use with caution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleClearData}
                            disabled={isInjecting || isClearing}
                            variant="destructive"
                            className="w-full"
                        >
                            {isClearing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Clearing Data...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All Test Data
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>How to Use</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-600">
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Configure the amount of test data you want to generate above</li>
                            <li>Click "Inject Complete Dataset" to generate both sales and products</li>
                            <li>Return to the dashboard to see the data reflected in real-time</li>
                            <li>Use "Clear All Test Data" when you want to start fresh</li>
                        </ol>
                        <p className="mt-4 text-xs text-gray-500">
                            Note: All data is scoped to your user account (tenant ID) and respects Row Level Security.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TestDataInjector;
