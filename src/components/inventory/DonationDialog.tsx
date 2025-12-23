import { useState, useEffect } from "react";
import { Heart, Package, Calendar } from "lucide-react";
import { donationService } from "@/services/donationService";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDonations } from "@/hooks/useDonations";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DonationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: {
        id: string;
        name: string;
        category: string;
        stock: number;
        price: number;
        expirationDate?: string;
    };
}

export function DonationDialog({ open, onOpenChange, product }: DonationDialogProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [observations, setObservations] = useState("");
    const [selectedNgo, setSelectedNgo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { ngos, fetchNgos } = useDonations();

    useEffect(() => {
        fetchNgos();
    }, []);

    // Reset quantity when dialog opens
    useEffect(() => {
        if (open && product?.stock) {
            setQuantity(product.stock);
        }
    }, [open, product?.stock]);

    const handleSubmit = async () => {
        const maxStock = product?.stock || 1;
        if (quantity <= 0 || quantity > maxStock) {
            toast.error("Cantidad inválida", {
                description: `La cantidad debe estar entre 1 y ${maxStock}`,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const productPrice = product?.price || 0;
            const productName = product?.name || 'Producto';

            // Create donation proposal using Service Layer
            await donationService.createProposal({
                product_id: product?.id && product.id !== 'demo-001' ? product.id : null,
                quantity: quantity,
                ngo: selectedNgo || 'Pendiente de asignar',
                pickup_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                observations: `${productName} - ${observations || 'Sin observaciones'}`,
                value_eur: productPrice * quantity,
                kg: quantity * 0.5,
                expiration_date: product?.expirationDate
            }, user?.id || 'demo-user');

            toast.success("¡Propuesta de donación creada!", {
                description: "Se ha enviado a la página de Donation Management.",
                duration: 5000,
            });

            // Close dialog and navigate to donations page
            onOpenChange(false);
            navigate("/donate?tab=donations");
        } catch (error) {
            console.error("Error creating donation proposal:", error);
            toast.error("Error al crear la propuesta de donación");
        } finally {
            setIsSubmitting(false);
        }
    };

    const safePrice = product?.price || 0;
    const safeQuantity = quantity || 0;
    const estimatedValue = (safePrice * safeQuantity).toFixed(2);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        Crear Propuesta de Donación
                    </DialogTitle>
                    <DialogDescription>
                        Completa los detalles para donar este producto a una ONG.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Product Info */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{product?.name || 'Producto'}</h4>
                            <Badge variant="secondary">{product?.category || 'Sin categoría'}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Stock: {product?.stock || 0}
                            </span>
                            {product?.expirationDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(product.expirationDate).toLocaleDateString('es-ES')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad a donar *</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={product?.stock || 100}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            placeholder="Cantidad"
                        />
                        <p className="text-xs text-muted-foreground">
                            Máximo disponible: {product?.stock || 0} unidades
                        </p>
                    </div>

                    {/* NGO Selection */}
                    <div className="space-y-2">
                        <Label>Lugar a donar (ONG)</Label>
                        <Select value={selectedNgo} onValueChange={setSelectedNgo}>
                            <SelectTrigger className="w-full">
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
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones (opcional)</Label>
                        <Textarea
                            id="observations"
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Notas adicionales sobre la donación..."
                            rows={3}
                        />
                    </div>

                    {/* Estimated Value */}
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">
                                Valor estimado de la donación:
                            </span>
                            <span className="font-bold text-green-700 dark:text-green-300">
                                €{estimatedValue}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || quantity <= 0}
                        className="bg-pink-600 hover:bg-pink-700"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <Heart className="w-4 h-4 mr-2" />
                        )}
                        Enviar Propuesta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
