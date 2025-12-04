import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Plus, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { BottomNav } from "@/components/Dashboard";
import { useDonations } from "@/hooks/useDonations";
import { RegisterNgoDialog } from "@/components/RegisterNgoDialog";

const donationFormSchema = z.object({
    product_id: z.string().optional(),
    quantity: z.string().min(1, "La cantidad es requerida"),
    pickup_time: z.string().optional(),
    observations: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

const DonationsPage = () => {
    const {
        ngos,
        donations,
        donationCandidates,
        loading,
        createDonation,
        scheduleDonation,
        generateDocument,
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

    const onSubmit = async (data: DonationFormData) => {
        if (!selectedNgo) {
            return;
        }

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
        if (!selectedNgo) {
            return;
        }

        await scheduleDonation(candidate, selectedNgo);
    };

    // Calculate metrics
    const thisMonthDonations = donations.filter((d) => {
        const donationDate = new Date(d.created_at);
        const now = new Date();
        return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
    });

    const totalKg = donations.reduce((sum, d) => sum + (d.kg || 0), 0);
    const totalValue = donations.reduce((sum, d) => sum + (d.value_eur || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <div className="max-w-7xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-sm w-full">
                <header className="px-6 pt-8 pb-6 sticky top-0 bg-white z-10 border-b">
                    <div className="flex items-center mb-1">
                        <Link to="/dashboard" className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-semibold">Donaciones y Cumplimiento Ley 1/2025</h1>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Conecta tu inventario con ONGs y genera documentación legal automáticamente
                    </p>
                </header>

                <main className="px-6 py-6 space-y-6">
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
                                    {loading ? (
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
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                <Button type="submit" disabled={loading || !selectedNgo}>
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

                    {/* Donation History */}
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
                                        {loading ? (
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
                                                            onClick={() => generateDocument(donation.id)}
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

                    <footer className="text-xs text-gray-500 text-center py-4">
                        Esta plataforma cumple con los requisitos de trazabilidad establecidos por la Ley 1/2025.
                        Todas las donaciones generan la documentación oficial requerida para auditorías e inspecciones.
                    </footer>
                </main>

                <BottomNav />
            </div>

            <RegisterNgoDialog open={isRegisterNgoOpen} onOpenChange={setIsRegisterNgoOpen} />
        </div>
    );
};

export default DonationsPage;
