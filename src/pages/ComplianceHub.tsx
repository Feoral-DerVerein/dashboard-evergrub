import { useRef, useEffect, useState } from "react";
import { HelpTooltip } from "@/components/dashboard/HelpTooltip";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/Dashboard";
import {
    ArrowLeft, FileText, Plus, Download, Upload, AlertTriangle,
    ShieldCheck, Search, FileWarning, Heart, Calendar, FileCheck
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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
import { DonationDialog } from "@/components/inventory/DonationDialog";
import { complianceService } from "@/services/complianceService";
import { ComplianceReportDialog } from "@/components/compliance/ComplianceReportDialog";
import { useTranslation } from "react-i18next";
import { Model182Dialog } from "@/components/compliance/Model182Dialog";
import { ComplianceDocumentGenerator } from "@/components/compliance/ComplianceDocumentGenerator";


const donationFormSchema = z.object({
    product_id: z.string().optional(),
    quantity: z.string().min(1, "La cantidad es requerida"),
    pickup_time: z.string().optional(),
    observations: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

const ComplianceHub = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    // --- Legal Compliance State & Logic ---
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    // New state for Model 182 Dialog
    const [isModel182Open, setIsModel182Open] = useState(false);

    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [generatorType, setGeneratorType] = useState('prevention_plan');
    const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);

    const openGenerator = (type: string) => {
        setGeneratorType(type);
        setIsGeneratorOpen(true);
    };

    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

    const handleOpenSchedule = (candidate: any) => {
        // Map candidate to product structure expected by DonationDialog
        const productForDialog = {
            id: candidate.product_id?.toString() || candidate.id?.toString(),
            name: candidate.name || candidate.product_name || "Producto sin nombre",
            category: "General", // Candidates might miss category, use default
            stock: candidate.quantity_available || 1,
            price: 5.00, // Default or fetch
            expirationDate: candidate.expiration_date
        };
        setSelectedCandidate(productForDialog);
        setIsDonationDialogOpen(true);
    };

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            if (!user?.uid) return;
            const data = await complianceService.getDocuments(user.uid);
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleGeneratePlan = async () => {
        try {
            if (!user?.uid) return;
            await complianceService.generatePlan(user.uid);

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
        pendingProposals,
        loading: loadingDonations,
        createDonation,
        scheduleDonation,
        fetchDonationHistory,
        fetchPendingProposals,
        uploadEvidence,
        uploadAgreement,
        generateDocument: generateDonationDocument,
    } = useDonations();

    // Upload Logic for Evidence
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);

    // Upload Logic for Agreements
    const agreementInputRef = useRef<HTMLInputElement>(null);
    const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);

    const handleUploadClick = (id: string) => {
        setSelectedDonationId(id);
        fileInputRef.current?.click();
    };

    const handleAgreementUploadClick = (id: string) => {
        setSelectedNgoId(id);
        agreementInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedDonationId) {
            await uploadEvidence(selectedDonationId, file);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedDonationId(null);
        }
    };

    const handleAgreementFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedNgoId) {
            await uploadAgreement(selectedNgoId, file);
            if (agreementInputRef.current) agreementInputRef.current.value = "";
            setSelectedNgoId(null);
        }
    };

    // Upload Logic for Waste Manager
    const wasteContractInputRef = useRef<HTMLInputElement>(null);
    const wasteCertificateInputRef = useRef<HTMLInputElement>(null);
    const [wasteContractUrl, setWasteContractUrl] = useState<string | null>(null);
    const [wasteCertificateUrl, setWasteCertificateUrl] = useState<string | null>(null);

    const handleWasteContractClick = () => {
        wasteContractInputRef.current?.click();
    };

    const handleWasteCertificateClick = () => {
        wasteCertificateInputRef.current?.click();
    };

    const handleWasteContractFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            setWasteContractUrl(URL.createObjectURL(file));
            toast.success("Contrato subido correctamente");
            if (wasteContractInputRef.current) wasteContractInputRef.current.value = "";
        }
    };

    const handleWasteCertificateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload
            await new Promise(resolve => setTimeout(resolve, 1000));
            setWasteCertificateUrl(URL.createObjectURL(file));
            toast.success("Certificados subidos correctamente");
            if (wasteCertificateInputRef.current) wasteCertificateInputRef.current.value = "";
        }
    };

    // Training Logic
    const trainingProtocolInputRef = useRef<HTMLInputElement>(null);
    const trainingWasteInputRef = useRef<HTMLInputElement>(null);

    // Unified State for Training Sessions
    const [trainingSessions, setTrainingSessions] = useState<any[]>([]);

    useEffect(() => {
        if (user?.uid) {
            fetchTrainingSessions();
        }
    }, [user?.uid]);

    const fetchTrainingSessions = async () => {
        if (!user?.uid) return;
        const sessions = await complianceService.getTrainingSessions(user.uid);
        // Add existing UI state properties like isEditing if needed, or map it
        setTrainingSessions(sessions.map(s => ({ ...s, isEditing: false })));
    };

    // Handlers for Uploads
    const handleTrainingFileChange = async (e: React.ChangeEvent<HTMLInputElement>, sessionId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Upload to Firebase Storage
                const { storageService } = await import('@/services/storageService');
                const url = await storageService.uploadTrainingEvidence(file, sessionId);

                // Update Firestore
                await complianceService.updateTrainingSession(sessionId, { evidence_url: url });

                // Update Local State
                setTrainingSessions(prev => prev.map(session =>
                    session.id === sessionId ? { ...session, evidence_url: url } : session
                ));

                toast.success("Acta de formación subida correctamente");
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("Error al subir el archivo");
            } finally {
                // Reset inputs
                if (sessionId === 'protocol' && trainingProtocolInputRef.current) trainingProtocolInputRef.current.value = "";
                if (sessionId === 'waste' && trainingWasteInputRef.current) trainingWasteInputRef.current.value = "";
            }
        }
    };

    const handleTrainingUploadClick = (inputType: 'protocol' | 'waste') => {
        if (inputType === 'protocol') trainingProtocolInputRef.current?.click();
        else trainingWasteInputRef.current?.click();
    };

    // Handlers for Editing
    const toggleEditSession = (id: string) => {
        setTrainingSessions(prev => prev.map(s =>
            s.id === id ? { ...s, isEditing: !s.isEditing } : s
        ));
    };

    const updateSessionField = async (id: string, field: 'date' | 'attendees', value: string | number) => {
        // Optimistic update
        setTrainingSessions(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));

        // Persist to DB
        try {
            await complianceService.updateTrainingSession(id, { [field]: value });
        } catch (error) {
            console.error("Failed to update session", error);
            // Revert or show toast on error
            toast.error("Error saving training record");
        }
    };

    // Refresh data when tab parameter changes to donations
    useEffect(() => {
        if (initialTab === 'donations') {
            fetchDonationHistory();
            fetchPendingProposals();
        }
    }, [initialTab]);

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
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:flex md:items-start md:justify-center md:pt-8">
            <div className="max-w-md md:max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm md:mb-8 w-full">
                <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
                    <div className="flex items-center mb-1">
                        <Link to="/dashboard" className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-semibold">{t('compliance_hub.title')}</h1>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Plataforma integral para el cumplimiento de la Ley 1/2025 de Prevención de las Pérdidas y el Desperdicio Alimentario.
                    </p>
                </header>

                <main className="px-6 py-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Tabs defaultValue={initialTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                                <TabsTrigger value="overview">Resumen</TabsTrigger>
                                <TabsTrigger value="prevention">Prevención</TabsTrigger>
                                <TabsTrigger value="donations">Donaciones</TabsTrigger>
                                <TabsTrigger value="waste">Residuos</TabsTrigger>
                                <TabsTrigger value="training">Formación</TabsTrigger>
                            </TabsList>

                            {/* --- TAB 1: OVERVIEW (Resumen) --- */}
                            <TabsContent value="overview" className="space-y-6">
                                {/* Risk Score & Alerts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-orange-50 border-orange-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                                <ShieldCheck className="h-5 w-5" />
                                                Nivel de Cumplimiento
                                                <HelpTooltip kpiName="Nivel de Cumplimiento" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-orange-700">Media</div>
                                            <p className="text-sm text-orange-600 mt-1">Atención requerida en 2 áreas</p>
                                            <div className="mt-4 text-xs text-orange-800 font-medium">
                                                Falta completar el Plan de Prevención
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="md:col-span-2">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                                Alertas de Cumplimiento
                                                <HelpTooltip kpiName="Alertas de Cumplimiento" />
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                    <FileWarning className="h-5 w-5 text-red-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-red-900">Plan de Prevención Pendiente</h4>
                                                        <p className="text-sm text-red-700">El plazo para presentar el plan anual vence en 15 días.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                    <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-yellow-900">Actualizar Convenios</h4>
                                                        <p className="text-sm text-yellow-700">Revisar vigencia de convenios con ONGs receptoras.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Key Indicators Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Donaciones (Mes)</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">{thisMonthDonations.length}</div></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">KG Recuperados</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">{totalKg.toFixed(1)} kg</div></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Mermas Registradas</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">12.5 kg</div></CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* --- TAB 2: PREVENTION (Prevención y Procedimientos) --- */}
                            <TabsContent value="prevention" className="space-y-6">
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div>
                                        <h2 className="text-lg font-semibold text-blue-900">Plan de Prevención del Desperdicio</h2>
                                        <p className="text-sm text-blue-700">Art. 13 de la Ley 1/2025. Obligatorio para todas las empresas.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                            onClick={() => setIsMonthlyReportOpen(true)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Descargar Reporte Mensual (PDF)
                                        </Button>
                                        <Button variant="outline" onClick={() => openGenerator('prevention_plan')}>
                                            <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Plan
                                        </Button>
                                    </div>
                                </div>

                                {/* Saved Plans Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            Historial de Planes
                                            <HelpTooltip kpiName="Historial de Planes" />
                                        </CardTitle>
                                        <CardDescription>Versiones guardadas y estado de aprobación</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Documento</TableHead>
                                                    <TableHead>Periodo</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Fecha Gen.</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loadingDocs ? (
                                                    <TableRow><TableCell colSpan={5} className="text-center py-4">Cargando...</TableCell></TableRow>
                                                ) : documents.length === 0 ? (
                                                    <TableRow><TableCell colSpan={5} className="text-center py-4 text-gray-500">No hay planes generados.</TableCell></TableRow>
                                                ) : (
                                                    documents.map((doc) => (
                                                        <TableRow key={doc.id}>
                                                            <TableCell className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</TableCell>
                                                            <TableCell>{doc.period_start ? `${new Date(doc.period_start).toLocaleDateString()} - ${new Date(doc.period_end).toLocaleDateString()}` : '-'}</TableCell>
                                                            <TableCell><Badge variant={doc.status === 'ready' ? 'default' : 'secondary'}>{doc.status}</Badge></TableCell>
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


                            </TabsContent>

                            {/* --- TAB 3: DONATIONS (Gestión de Donaciones) --- */}
                            <TabsContent value="donations" className="space-y-6">
                                {/* Donation Sub-tabs could be implemented here, but stacking sections is fine for now */}

                                {/* Donation Agreements (Block 2) */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                Convenios de Donación
                                                <HelpTooltip kpiName="Convenios de Donación" />
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setIsRegisterNgoOpen(true)}>
                                                    Registrar ONG
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => openGenerator('donation_agreement')}>
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="h-3 w-3" /> Nuevo Convenio
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription>Contratos vigentes con entidades receptoras</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            {ngos.map(ngo => (
                                                <div key={ngo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white p-2 rounded border"><Heart className="h-4 w-4 text-pink-500" /></div>
                                                        <div>
                                                            <div className="font-medium text-sm">{ngo.name}</div>
                                                            <div className="text-xs text-gray-500">Vigente hasta: 31/12/2025</div>
                                                        </div>
                                                    </div>
                                                    {ngo.agreement_url ? (
                                                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => window.open(ngo.agreement_url, '_blank')}>
                                                            Ver Convenio
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleAgreementUploadClick(ngo.id)}>
                                                            <Upload className="h-3 w-3 mr-2" /> Subir Convenio
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Create Proposals (Existing) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-orange-600" />
                                                    Propuestas de Donación Pendientes
                                                    <HelpTooltip kpiName="Propuestas de Donación Pendientes" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {loadingDonations ? (
                                                    <div className="text-center py-4">Cargando...</div>
                                                ) : donationCandidates.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500">No hay candidatos actualmente</div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {donationCandidates.map((item) => (
                                                            <div key={item.id} className="p-4 border rounded-lg flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold">{item.name}</div>
                                                                    <div className="text-sm text-gray-500">Caduca: {new Date(item.expiration_date).toLocaleDateString()}</div>
                                                                </div>
                                                                <Button size="sm" onClick={() => handleOpenSchedule(item)} className="bg-green-600 hover:bg-green-700 text-white">Programar</Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Donation History (Block 3 & 4) */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2">
                                                        Registros de Donación
                                                        <HelpTooltip kpiName="Registros de Donación" />
                                                    </CardTitle>
                                                    <Button size="sm" variant="outline" onClick={() => openGenerator('compliance_cert')}><Upload className="h-4 w-4 mr-2" />Generar Certificado</Button>
                                                </div>
                                                <CardDescription>Historial y certificados de entrega</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Fecha</TableHead>
                                                                <TableHead>ONG</TableHead>
                                                                <TableHead>Cant.</TableHead>
                                                                <TableHead>Estado</TableHead>
                                                                <TableHead className="text-right">Evidencia</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {donations.length === 0 ? (
                                                                <TableRow><TableCell colSpan={5} className="text-center py-4">Sin registros</TableCell></TableRow>
                                                            ) : (
                                                                donations.map((donation) => (
                                                                    <TableRow key={donation.id}>
                                                                        <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                                                                        <TableCell className="font-medium">{donation.ngo}</TableCell>
                                                                        <TableCell>{donation.quantity}</TableCell>
                                                                        <TableCell><Badge variant="outline">{donation.status}</Badge></TableCell>
                                                                        <TableCell className="text-right">
                                                                            {donation.document_url ? (
                                                                                <Button variant="ghost" size="sm" onClick={() => window.open(donation.document_url, '_blank')} title={donation.evidence_name || "Ver evidencia"}>
                                                                                    <FileCheck className="h-4 w-4 text-green-600" />
                                                                                </Button>
                                                                            ) : (
                                                                                <Button variant="ghost" size="sm" onClick={() => handleUploadClick(donation.id)}>
                                                                                    <Upload className="h-4 w-4 text-blue-600" />
                                                                                </Button>
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Compliance Center & Model 182 Card - MOVED TO SIDEBAR */}
                                </div>
                            </TabsContent>

                            {/* --- TAB 4: WASTE (Residuos y Mermas) --- */}
                            <TabsContent value="waste" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Loss Register (Block 6) */}
                                    <Card className="md:col-span-2">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    Registro de Pérdidas y Mermas
                                                    <HelpTooltip kpiName="Registro de Pérdidas y Mermas" />
                                                </CardTitle>
                                                <Button size="sm" onClick={() => openGenerator('management_report')}><Plus className="h-4 w-4 mr-2" />Registrar/Generar Informe</Button>
                                            </div>
                                            <CardDescription>Obligación de medición interna</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Fecha</TableHead>
                                                        <TableHead>Motivo</TableHead>
                                                        <TableHead>Producto</TableHead>
                                                        <TableHead>KG</TableHead>
                                                        <TableHead>Destino Final</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>10/12/2024</TableCell>
                                                        <TableCell>Madurez</TableCell>
                                                        <TableCell>Fruta Variada</TableCell>
                                                        <TableCell>5.0 kg</TableCell>
                                                        <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Transformación (Zumos)</Badge></TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>09/12/2024</TableCell>
                                                        <TableCell>Estético</TableCell>
                                                        <TableCell>Pan del día anterior</TableCell>
                                                        <TableCell>3.0 kg</TableCell>
                                                        <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Alimentación Animal</Badge></TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>08/12/2024</TableCell>
                                                        <TableCell>Caducidad</TableCell>
                                                        <TableCell>Pack Yogures</TableCell>
                                                        <TableCell>2.5 kg</TableCell>
                                                        <TableCell><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Compostaje</Badge></TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>08/12/2024</TableCell>
                                                        <TableCell>Rotura</TableCell>
                                                        <TableCell>Botellas Aceite</TableCell>
                                                        <TableCell>1.0 kg</TableCell>
                                                        <TableCell><Badge variant="outline" className="text-gray-600">Gestor de Residuos</Badge></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    {/* Waste Manager (Block 7) */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                Gestor de Residuos
                                                <HelpTooltip kpiName="Gestor de Residuos" />
                                            </CardTitle>
                                            <CardDescription>Acreditaciones y Contratos</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-3 border rounded-lg bg-gray-50">
                                                <div className="font-semibold text-sm">EcoGestión S.L.</div>
                                                <div className="text-xs text-gray-500">NIMA: 123456789</div>
                                                <div className="flex gap-2 mt-2">
                                                    {wasteContractUrl ? (
                                                        <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600" onClick={() => window.open(wasteContractUrl, '_blank')}>
                                                            Ver Contrato
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleWasteContractClick}>
                                                            <Upload className="h-3 w-3 mr-2" /> Subir Contrato
                                                        </Button>
                                                    )}

                                                    {wasteCertificateUrl ? (
                                                        <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600" onClick={() => window.open(wasteCertificateUrl, '_blank')}>
                                                            Ver Certificados
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleWasteCertificateClick}>
                                                            <Upload className="h-3 w-3 mr-2" /> Subir Certificados
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* --- TAB 5: TRAINING (Formación) --- */}
                            <TabsContent value="training" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                Registro de Formación del Personal
                                                <HelpTooltip kpiName="Registro de Formación del Personal" />
                                            </CardTitle>
                                            <Button size="sm"><Upload className="h-4 w-4 mr-2" />Subir Acta</Button>
                                        </div>
                                        <CardDescription>Evidencias de capacitación sobre el Plan de Prevención</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Formación</TableHead>
                                                    <TableHead>Asistentes</TableHead>
                                                    <TableHead>Evidencia</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {trainingSessions.map((session) => (
                                                    <TableRow key={session.id}>
                                                        <TableCell>
                                                            {session.isEditing ? (
                                                                <Input
                                                                    value={session.date}
                                                                    onChange={(e) => updateSessionField(session.id, 'date', e.target.value)}
                                                                    className="h-7 w-28 text-xs"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center gap-2 group">
                                                                    {session.date}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => toggleEditSession(session.id)}
                                                                    >
                                                                        <span className="text-xs text-gray-400 hover:text-blue-600">✎</span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{session.topic}</TableCell>
                                                        <TableCell>
                                                            {session.isEditing ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        value={session.attendees}
                                                                        onChange={(e) => updateSessionField(session.id, 'attendees', parseInt(e.target.value) || 0)}
                                                                        className="h-7 w-16 text-xs"
                                                                    />
                                                                    <span className="text-xs text-gray-500">empleados</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 group">
                                                                    {session.attendees} empleados
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => toggleEditSession(session.id)}
                                                                    >
                                                                        <span className="text-xs text-gray-400 hover:text-blue-600">✎</span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {session.evidenceUrl ? (
                                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 cursor-pointer" onClick={() => window.open(session.evidenceUrl!, '_blank')}>
                                                                    <FileCheck className="h-3 w-3 mr-1" /> Ver Acta
                                                                </Badge>
                                                            ) : (
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600" onClick={() => handleTrainingUploadClick(session.id as 'protocol' | 'waste')}>
                                                                    <Upload className="h-3 w-3 mr-1" /> Subir Acta
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {session.isEditing ? (
                                                                <Button size="sm" onClick={() => toggleEditSession(session.id)} className="h-7 text-xs">Guardar</Button>
                                                            ) : (
                                                                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Compliance Center & Model 182 Card (Sticky Sidebar) */}
                            <Card className="bg-white text-slate-900 shadow-md border-slate-200">
                                <CardHeader className="pb-2">
                                    <div className="mb-2">
                                        <p className="text-sm font-medium text-slate-500">Centro de Documentación</p>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                                        Fiscalidad (Modelo 182) y Ley 1/2025
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="text-3xl font-extrabold text-slate-900 mb-1">€{totalValue.toFixed(2)}</div>
                                        <p className="text-sm font-medium text-slate-500">Total deducible ejercicio actual</p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Model 182 Button */}
                                        <Button
                                            size="sm"
                                            className="w-full justify-center bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-medium"
                                            onClick={() => setIsModel182Open(true)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Generar Modelo 182 (AEAT)
                                        </Button>

                                        {/* General Compliance Button */}
                                        <Button
                                            size="sm"
                                            className="w-full justify-center bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                                            onClick={() => openGenerator('prevention_plan')}
                                        >
                                            <FileCheck className="h-4 w-4 mr-2" />
                                            Resto de Documentación
                                        </Button>

                                        <p className="text-[10px] text-slate-400 text-center">
                                            Incluye: Plan Prevención, Registros, Certificados...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Helper Card for Quick Links */}
                            <Card className="bg-white border-slate-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-700">¿Necesitas Ayuda?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-slate-500 mb-2">Consulta la guía oficial de la Ley de Prevención.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() => window.open('https://www.boe.es/buscar/act.php?id=BOE-A-2025-6597', '_blank')}
                                    >
                                        Ver Normativa
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                <BottomNav />
            </div >

            <RegisterNgoDialog open={isRegisterNgoOpen} onOpenChange={setIsRegisterNgoOpen} />
            <Model182Dialog
                open={isModel182Open}
                onOpenChange={setIsModel182Open}
                donations={donations}
                user={user}
            />

            <ComplianceDocumentGenerator
                open={isGeneratorOpen}
                onOpenChange={setIsGeneratorOpen}
                donations={donations as any}
                defaultType={generatorType}
            />

            {/* Hidden File Input for Evidence Upload */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            {/* Donation Dialog for Candidates */}
            <DonationDialog
                open={isDonationDialogOpen}
                onOpenChange={setIsDonationDialogOpen}
                product={selectedCandidate}
            />

            {/* Hidden File Input for Agreement Upload */}
            <input
                type="file"
                ref={agreementInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleAgreementFileChange}
            />

            {/* Hidden Inputs for Waste Manager */}
            <input
                type="file"
                ref={wasteContractInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleWasteContractFileChange}
            />
            <input
                type="file"
                ref={wasteCertificateInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleWasteCertificateFileChange}
            />

            {/* Hidden Inputs for Training */}
            <input
                type="file"
                ref={trainingProtocolInputRef}
                className="hidden"
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleTrainingFileChange(e, 'protocol')}
            />
            <input
                type="file"
                ref={trainingWasteInputRef}
                className="hidden"
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleTrainingFileChange(e, 'waste')}
            />
            <ComplianceReportDialog
                open={isMonthlyReportOpen}
                onOpenChange={setIsMonthlyReportOpen}
            />
        </div >
    );
};

export default ComplianceHub;
