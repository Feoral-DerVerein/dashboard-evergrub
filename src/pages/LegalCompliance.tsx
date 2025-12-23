
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/Dashboard";
import { ArrowLeft, FileText, Plus, Download, Upload, AlertTriangle, ShieldCheck, Search, FileWarning } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const LegalCompliance = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const { complianceService } = await import('@/services/complianceService');
            if (!user?.id) return;
            const data = await complianceService.getDocuments(user.id);
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePlan = async () => {
        try {
            const { complianceService } = await import('@/services/complianceService');
            if (!user?.id) return;
            await complianceService.generatePlan(user.id);

            toast.success("Prevention Plan generation started", {
                description: "You will be notified when it is ready."
            });
            setIsGenerateOpen(false);
            fetchDocuments();
        } catch (error) {
            console.error("Error generating plan:", error);
            toast.error("Failed to start generation");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
            <div className="max-w-md md:max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:my-0 w-full">
                <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
                    <div className="flex items-center mb-1">
                        <Link to="/dashboard" className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-semibold">Legal Compliance (Ley 1/2025)</h1>
                    </div>
                </header>

                <main className="px-6 py-4 space-y-6">
                    {/* Risk Score & Alerts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-orange-50 border-orange-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Regulatory Risk Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-orange-700">Medium (45/100)</div>
                                <p className="text-sm text-orange-600 mt-1">Potential fines: €2,001 - €60,000</p>
                                <div className="mt-4 text-xs text-orange-800 font-medium">
                                    Why? Missing donation receipts for last month.
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileWarning className="h-5 w-5 text-red-500" />
                                    Non-Compliance Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-red-900">Mandatory Donation Quota Not Met</h4>
                                            <p className="text-sm text-red-700">You have donated 12% of surplus. Law requires 20% for your tier.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-900">Audit Report Due</h4>
                                            <p className="text-sm text-yellow-700">Annual waste audit report is due in 15 days.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium">Legal Documents</h2>
                            <p className="text-sm text-gray-500">Manage your prevention plans and audits.</p>
                        </div>
                        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Generate Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Generate Prevention Plan</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <p className="text-sm text-gray-600">
                                        This will generate a new Food Waste Prevention Plan based on your current inventory and sales data, compliant with local regulations.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                                        <Button onClick={handleGeneratePlan}>Generate</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                                        </TableRow>
                                    ) : documents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">No documents found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium capitalize">
                                                    {doc.document_type.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell>
                                                    {doc.period_start ? `${new Date(doc.period_start).toLocaleDateString()} - ${new Date(doc.period_end).toLocaleDateString()}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'}>
                                                        {doc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(doc.generated_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" disabled={doc.status !== 'ready'}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Traceability Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-blue-600" />
                                Complete Traceability Log
                            </CardTitle>
                            <CardDescription>Track every item from entry to exit (Sale, Donation, or Waste)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">BATCH-2024-001</Badge>
                                        <span className="font-medium">Organic Avocados (50kg)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-green-600">30kg Sold</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-pink-600">15kg Donated</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-red-600">5kg Waste</span>
                                    </div>
                                </div>
                                {/* More simulated logs could go here */}
                            </div>
                        </CardContent>
                    </Card>
                </main>

                <BottomNav />
            </div>
        </div>
    );
};

export default LegalCompliance;
