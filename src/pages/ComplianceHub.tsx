import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/Dashboard";
import {
    ArrowLeft, FileText, Plus, Download, Upload, AlertTriangle,
    ShieldCheck, Search, FileWarning, Heart, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useDonations } from "@/hooks/useDonations";
import { RegisterNgoDialog } from "@/components/RegisterNgoDialog";
import ComplianceReportGenerator from "@/components/compliance/ComplianceReportGenerator";
import { useTranslation } from "react-i18next";

// --- Types & Schemas from DonationsPage ---
const donationFormSchema = z.object({
    product_id: z.string().optional(),
    quantity: z.string().min(1, "La cantidad es requerida"),
    pickup_time: z.string().optional(),
    observations: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

const ComplianceHub = () => {
    const { t } = useTranslation();
    // --- Legal Compliance State & Logic ---
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('legal_documents')
                .select('*')
                .eq('tenant_id', user?.id)
                .order('generated_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleGeneratePlan = async () => {
        try {
            const { error } = await supabase.from('legal_documents').insert({
                tenant_id: user?.id,
                document_type: 'prevention_plan',
                status: 'generating',
                period_start: new Date().toISOString(),
                period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            });

            if (error) throw error;

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

    // --- Donations State & Logic ---
    const {
        ngos,
        donations,
        donationCandidates,
        loading: loadingDonations,
        createDonation,
        scheduleDonation,
        generateDocument: generateDonationDocument,
    } = useDonations();

    const [selectedNgo, setSelectedNgo] = useState("");
    const [isRegisterNgoOpen, setIsRegisterNgoOpen] = useState(false);

    const form = useForm<DonationFormData>({
        resolver: zodResolver(donationFormSchema),
        defaultValues: {
            product_id: "",
            quantity: "",
            pickup_time: "",
            observations: "",
        },
    });

    const onDonationSubmit = async (data: DonationFormData) => {
        if (!selectedNgo) return;

        const success = await createDonation({
            product_id: data.product_id,
            quantity: parseFloat(data.quantity),
            ngo: selectedNgo,
            pickup_time: data.pickup_time,
            observations: data.observations,
        });

        if (success) {
            form.reset();
            setSelectedNgo("");
        }
    };

    const handleScheduleDonation = async (candidate: any) => {
        if (!selectedNgo) return;
        await scheduleDonation(candidate, selectedNgo);
    };

    // Metrics for Donations
    const thisMonthDonations = donations.filter((d) => {
        const donationDate = new Date(d.created_at);
        const now = new Date();
        return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
    });
    const totalKg = donations.reduce((sum, d) => sum + (d.kg || 0), 0);
    const totalValue = donations.reduce((sum, d) => sum + (d.value_eur || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-center md:justify-center">
            <div className="max-w-md md:max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:my-0 w-full">
                <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
                    <div className="flex items-center mb-1">
                        <Link to="/dashboard" className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-semibold">{t('compliance_hub.title')}</h1>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('compliance_hub.subtitle')}
                    </p>
                </header>

                <main className="px-6 py-4">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">{t('compliance_hub.tabs.overview')}</TabsTrigger>
                            <TabsTrigger value="donations">{t('compliance_hub.tabs.donations')}</TabsTrigger>
                        </TabsList>

                        {/* --- TAB 1: Compliance Overview --- */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Risk Score & Alerts Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-orange-50 border-orange-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                            <AlertTriangle className="h-5 w-5" />
                                            {t('compliance_hub.risk_score.title')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-orange-700">{t('compliance_hub.risk_score.medium')}</div>
                                        <p className="text-sm text-orange-600 mt-1">{t('compliance_hub.risk_score.potential_fines')}</p>
                                        <div className="mt-4 text-xs text-orange-800 font-medium">
                                            {t('compliance_hub.risk_score.reason')}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileWarning className="h-5 w-5 text-red-500" />
                                            {t('compliance_hub.alerts.title')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-red-900">{t('compliance_hub.alerts.quota_title')}</h4>
                                                    <p className="text-sm text-red-700">{t('compliance_hub.alerts.quota_desc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-yellow-900">{t('compliance_hub.alerts.audit_title')}</h4>
                                                    <p className="text-sm text-yellow-700">{t('compliance_hub.alerts.audit_desc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-medium">{t('compliance_hub.legal_docs.title')}</h2>
                                    <p className="text-sm text-gray-500">{t('compliance_hub.legal_docs.subtitle')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <ComplianceReportGenerator />
                                    <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <Plus className="mr-2 h-4 w-4" /> {t('compliance_hub.legal_docs.generate_btn')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('compliance_hub.legal_docs.dialog_title')}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <p className="text-sm text-gray-600">
                                                    {t('compliance_hub.legal_docs.dialog_desc')}
                                                </p>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>{t('compliance_hub.legal_docs.cancel')}</Button>
                                                    <Button onClick={handleGeneratePlan}>{t('compliance_hub.legal_docs.generate')}</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
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
                                            {loadingDocs ? (
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

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5 text-blue-600" />
                                        {t('compliance_hub.traceability.title')}
                                    </CardTitle>
                                    <CardDescription>{t('compliance_hub.traceability.desc')}</CardDescription>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- TAB 2: Donation Management --- */}
                        <TabsContent value="donations" className="space-y-6">
                            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Content Area */}
                                <div className="col-span-2 space-y-6">
                                    {/* Donation Candidates */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-orange-600" />
                                                Propuestas de Donación
                                            </CardTitle>
                                            <CardDescription>Productos próximos a vencer (próximos 7 días)</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {loadingDonations ? (
                                                <div className="text-center py-4 text-gray-500">Cargando...</div>
                                            ) : donationCandidates.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    No hay productos candidatos en este momento
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {donationCandidates.map((item) => (
                                                        <div key={item.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                                                            <div>
                                                                <div className="font-semibold">{item.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    Caduca: {new Date(item.expiration_date).toLocaleDateString('es-ES')}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Cantidad disponible: {item.quantity_available}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleScheduleDonation(item)}
                                                                    disabled={!selectedNgo}
                                                                >
                                                                    Programar donación
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Manual Donation Form */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Crear Donación Manual</CardTitle>
                                            <CardDescription>Registra una donación manualmente</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onDonationSubmit)} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="product_id"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Product ID (SKU)</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="SKU del producto" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="quantity"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Cantidad *</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="0" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="pickup_time"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Fecha de Recogida</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="datetime-local" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormItem>
                                                            <FormLabel>ONG *</FormLabel>
                                                            <Select value={selectedNgo} onValueChange={setSelectedNgo}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecciona una ONG" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {ngos.map((ngo) => (
                                                                        <SelectItem key={ngo.id} value={ngo.name}>
                                                                            {ngo.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="observations"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Observaciones</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Notas adicionales sobre la donación..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex gap-2">
                                                        <Button type="submit" disabled={loadingDonations || !selectedNgo}>
                                                            Crear Donación
                                                        </Button>
                                                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                                                            Limpiar
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <aside className="space-y-4">
                                    {/* NGOs List */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-5 w-5 text-pink-600" />
                                                ONGs Registradas
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {ngos.length === 0 ? (
                                                <div className="text-sm text-gray-500 text-center py-4">
                                                    No hay ONGs registradas
                                                </div>
                                            ) : (
                                                ngos.map((ngo) => (
                                                    <div key={ngo.id} className="border-b pb-2 last:border-b-0">
                                                        <div className="font-semibold text-sm">{ngo.name}</div>
                                                        <div className="text-xs text-gray-500">{ngo.contact_email}</div>
                                                        <div className="text-xs text-gray-500">{ngo.contact_phone}</div>
                                                    </div>
                                                ))
                                            )}
                                            <Button
                                                className="w-full"
                                                variant="outline"
                                                onClick={() => setIsRegisterNgoOpen(true)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Registrar ONG
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Indicators */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Indicadores</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Donaciones este mes:</span>
                                                <strong>{thisMonthDonations.length}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">KG recuperados:</span>
                                                <strong>{totalKg.toFixed(2)}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Valor estimado:</span>
                                                <strong>€{totalValue.toFixed(2)}</strong>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </aside>
                            </section>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Donaciones</CardTitle>
                                    <CardDescription>Todas las donaciones registradas en el sistema</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>ONG</TableHead>
                                                    <TableHead>Cantidad</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loadingDonations ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-4">
                                                            Cargando...
                                                        </TableCell>
                                                    </TableRow>
                                                ) : donations.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                            No hay donaciones registradas
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    donations.map((donation) => (
                                                        <TableRow key={donation.id}>
                                                            <TableCell>{new Date(donation.created_at).toLocaleDateString('es-ES')}</TableCell>
                                                            <TableCell className="font-medium">{donation.ngo}</TableCell>
                                                            <TableCell>{donation.quantity}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        donation.status === "delivered"
                                                                            ? "default"
                                                                            : donation.status === "picked_up"
                                                                                ? "secondary"
                                                                                : "outline"
                                                                    }
                                                                >
                                                                    {donation.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => generateDonationDocument(donation.id)}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>

                <BottomNav />
            </div>

            <RegisterNgoDialog open={isRegisterNgoOpen} onOpenChange={setIsRegisterNgoOpen} />
        </div>
    );
};

export default ComplianceHub;
