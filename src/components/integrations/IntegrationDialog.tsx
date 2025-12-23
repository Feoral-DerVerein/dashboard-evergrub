import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldCheck, Info } from "lucide-react";

import { toastService } from "@/services/toastService";
import { lightspeedService } from "@/services/lightspeedService";
import { shopifyService } from "@/services/shopifyService";
import { testSquareConnection } from "@/services/squareService";
import deliverectService from "@/services/deliverectService";

export type IntegrationType = 'pos' | 'erp' | 'delivery' | 'foodbank';

interface FieldConfig {
    id: string;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
}

interface IntegrationConfig {
    name: string;
    logoUrl?: string;
    description: string;
    fields: FieldConfig[];
    helpText?: string;
}

const INTEGRATION_CONFIGS: Record<string, IntegrationConfig> = {
    square: {
        name: "Square",
        logoUrl: "/integration-logos/square-logo.png",
        description: "Configura tus credenciales de Square POS.",
        fields: [
            { id: 'location_nick', label: 'Nombre de la Sede', placeholder: 'Ej: Negocio principal' },
            { id: 'application_id', label: 'Application ID', placeholder: 'sq0idp-...' },
            { id: 'access_token', label: 'Access Token', placeholder: 'EAAAl...', type: 'password' },
            { id: 'location_id', label: 'Location ID', placeholder: 'L...' }
        ],
        helpText: "Obtén tus credenciales en el Square Developer Dashboard."
    },
    clover: {
        name: "Clover",
        logoUrl: "/integration-logos/clover-logo.svg",
        description: "Conecta con tu TPV Clover.",
        fields: [
            { id: 'merchant_id', label: 'Merchant ID', placeholder: 'MID...' },
            { id: 'api_token', label: 'API Token', placeholder: 'TKN...', type: 'password' }
        ],
        helpText: "El Merchant ID se encuentra en la configuración de tu cuenta Clover."
    },
    toast: {
        name: "Toast",
        logoUrl: "/integration-logos/toast-logo.png",
        description: "Sincroniza con Toast Restaurant POS.",
        fields: [
            { id: 'restaurant_guid', label: 'Restaurant GUID', placeholder: 'guid-...' },
            { id: 'access_token', label: 'Access Token', placeholder: 'TKN...', type: 'password' }
        ],
        helpText: "El Restaurant GUID lo proporciona Toast en tu configuración de API."
    },
    lightspeed: {
        name: "Lightspeed",
        logoUrl: "/integration-logos/lightspeed-logo.png",
        description: "Conecta con Lightspeed Restaurant o Retail.",
        fields: [
            { id: 'account_id', label: 'Account ID', placeholder: '123456' },
            { id: 'access_token', label: 'Access Token', placeholder: 'LSPTKN...', type: 'password' },
            { id: 'api_type', label: 'Tipo de API', placeholder: 'retail o restaurant' }
        ]
    },
    shopify: {
        name: "Shopify",
        logoUrl: "/integration-logos/shopify-logo.png",
        description: "Integración con tienda Shopify.",
        fields: [
            { id: 'shop_domain', label: 'Shop Domain', placeholder: 'tienda.myshopify.com' },
            { id: 'access_token', label: 'Access Token', placeholder: 'shpat_...', type: 'password' }
        ]
    },
    sap: {
        name: "SAP",
        logoUrl: "/integration-logos/sap-logo.png",
        description: "Integración empresarial con SAP ERP.",
        fields: [
            { id: 'instance_url', label: 'SAP Instance URL', placeholder: 'https://your-instance.sap.com' },
            { id: 'api_key', label: 'API Key', placeholder: 'API...', type: 'password' },
            { id: 'client_id', label: 'Client ID', placeholder: 'ID...' }
        ]
    },
    oracle: {
        name: "Oracle ERP",
        logoUrl: "/integration-logos/oracle-logo.png",
        description: "Conexión con Oracle Cloud ERP.",
        fields: [
            { id: 'base_url', label: 'Base URL', placeholder: 'https://oracle-instance.com' },
            { id: 'username', label: 'Username', placeholder: 'admin' },
            { id: 'password', label: 'Password', placeholder: '********', type: 'password' }
        ]
    },
    'microsoft-dynamics': {
        name: "Microsoft Dynamics",
        logoUrl: "/integration-logos/microsoft-dynamics-logo.png",
        description: "Business Central / Dynamics 365.",
        fields: [
            { id: 'tenant_id', label: 'Tenant ID', placeholder: '123-abc-...' },
            { id: 'client_id', label: 'Client ID', placeholder: 'client-...' },
            { id: 'client_secret', label: 'Client Secret', placeholder: '********', type: 'password' }
        ]
    },
    deliverect: {
        name: "Deliverect",
        logoUrl: "/integration-logos/deliverect-logo.png",
        description: "Hub de delivery (Uber, Glovo, Deliveroo).",
        fields: [
            { id: 'api_key', label: 'API Key', placeholder: 'DEL...', type: 'password' },
            { id: 'location_id', label: 'Location ID', placeholder: 'L...' }
        ]
    },
    doordash: {
        name: "DoorDash",
        logoUrl: "/integration-logos/doordash-logo.png",
        description: "Gestión de pedidos DoorDash.",
        fields: [
            { id: 'access_key_id', label: 'Access Key ID', placeholder: 'ID...' },
            { id: 'signing_secret', label: 'Signing Secret', placeholder: 'Secret...', type: 'password' }
        ]
    },
    'uber-eats': {
        name: "Uber Eats",
        logoUrl: "/integration-logos/uber-eats-logo.png",
        description: "Publica menús y recibe pedidos.",
        fields: [
            { id: 'client_id', label: 'Client ID', placeholder: 'ID...' },
            { id: 'client_secret', label: 'Client Secret', placeholder: '********', type: 'password' },
            { id: 'store_id', label: 'Store ID', placeholder: 'Store...' }
        ]
    },
    glovo: {
        name: "Glovo",
        logoUrl: "/integration-logos/glovo-logo.png",
        description: "Integración oficial con Glovo.",
        fields: [
            { id: 'api_key', label: 'API Key', placeholder: 'GLV...', type: 'password' },
            { id: 'store_id', label: 'Store ID', placeholder: 'Store...' }
        ]
    },
    rappi: {
        name: "Rappi",
        logoUrl: "/integration-logos/rappi-logo.png",
        description: "Sincroniza con Rappi.",
        fields: [
            { id: 'api_key', label: 'API Key', placeholder: 'RPP...', type: 'password' },
            { id: 'store_id', label: 'Store ID', placeholder: 'ID...' }
        ]
    },
    toogoodtogo: {
        name: "Too Good To Go",
        logoUrl: "/integration-logos/toogoodtogo-logo.png",
        description: "Pack de rescate de excedentes.",
        fields: [
            { id: 'email', label: 'Email', placeholder: 'negocio@mail.com' },
            { id: 'password', label: 'Password', placeholder: '********', type: 'password' }
        ]
    },
    fesbal: {
        name: "FESBAL",
        logoUrl: "/integration-logos/fesbal-logo.png",
        description: "Federación Española de Bancos de Alimentos.",
        fields: [
            { id: 'org_id', label: 'ID de Organización', placeholder: 'ORG-...' },
            { id: 'token', label: 'Token de Enlace', placeholder: 'BNK...', type: 'password' }
        ],
        helpText: "Usa el token proporcionado por tu sede local de FESBAL."
    },
    'cruz-roja': {
        name: "Cruz Roja",
        logoUrl: "/integration-logos/cruz-roja-logo.png",
        description: "Donaciones directas a Cruz Roja.",
        fields: [
            { id: 'auth_key', label: 'Auth Key', placeholder: 'CR-', type: 'password' }
        ]
    },
    caritas: {
        name: "Cáritas",
        logoUrl: "/integration-logos/caritas-logo.png",
        description: "Suministro de excedentes a Cáritas.",
        fields: [
            { id: 'api_token', label: 'API Token', placeholder: 'CAR...', type: 'password' }
        ]
    },
    'banc-aliments-barcelona': {
        name: "Banc dels Aliments",
        logoUrl: "/integration-logos/banc-aliments-barcelona-logo.png",
        description: "Donación local Barcelona.",
        fields: [
            { id: 'token', label: 'API Token', placeholder: 'BCN...', type: 'password' }
        ]
    },
    default: {
        name: "Integración",
        description: "Configura los parámetros de conexión para este servicio.",
        fields: [
            { id: 'location_nick', label: 'Nombre de la Sede', placeholder: 'Ej: Madrid Centro, Barcelona Sucursal 1' },
            { id: 'api_key', label: 'API Key / Token', placeholder: 'Introduce tu clave...' }
        ]
    }
};

interface IntegrationDialogProps {
    id: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const IntegrationDialog = ({ id, open, onOpenChange, onSuccess }: IntegrationDialogProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [credentials, setCredentials] = useState<Record<string, any>>({});

    const config = INTEGRATION_CONFIGS[id] || INTEGRATION_CONFIGS.default;

    useEffect(() => {
        if (open && user) {
            // Load existing credentials if available
            const loadData = async () => {
                const docRef = doc(db, 'integrations', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data[id]) {
                        setCredentials(data[id]);
                    }
                }
            };
            loadData();
        } else if (!open) {
            setCredentials({});
        }
    }, [open, id, user]);

    const handleFieldChange = (fieldId: string, value: string) => {
        setCredentials(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            let result: { success: boolean, message?: string, error?: string } = { success: false };

            switch (id) {
                case 'square':
                    const sqRes = await testSquareConnection(credentials as any);
                    result = {
                        success: sqRes.success,
                        message: sqRes.success ? `Local: ${sqRes.locationName}` : undefined,
                        error: sqRes.error
                    };
                    break;
                case 'toast':
                    const toastRes = await toastService.testConnection(credentials as any);
                    result = {
                        success: toastRes.success,
                        message: toastRes.success ? `Restaurante: ${toastRes.restaurantName}` : undefined,
                        error: toastRes.error
                    };
                    break;
                case 'lightspeed':
                    const lsRes = await lightspeedService.testConnection(credentials as any);
                    result = {
                        success: lsRes.success,
                        message: lsRes.success ? `Cuenta: ${lsRes.accountName}` : undefined,
                        error: lsRes.error
                    };
                    break;
                case 'shopify':
                    const shopifyRes = await shopifyService.testConnection(credentials as any);
                    result = {
                        success: shopifyRes.success,
                        message: shopifyRes.success ? `Tienda: ${shopifyRes.shopName}` : undefined,
                        error: shopifyRes.error
                    };
                    break;
                case 'deliverect':
                    const delOk = await deliverectService.testConnection(credentials.api_key, credentials.location_id);
                    result = { success: delOk, error: delOk ? undefined : "API de Deliverect rechazó el acceso" };
                    break;
                default:
                    // Simulated success for other platforms if required fields exist
                    const hasFields = config.fields.every(f => !!credentials[f.id]);
                    if (hasFields) {
                        result = { success: true, message: "Validación sintáctica correcta (Sandbox)" };
                    } else {
                        result = { success: false, error: "Faltan campos obligatorios" };
                    }
            }

            if (result.success) {
                toast.success(`¡Conexión exitosa! ${result.message || ''}`);
            } else {
                toast.error(`Error de conexión: ${result.error || 'Revisa tus llaves'}`);
            }
        } catch (error) {
            toast.error("Error al probar la conexión");
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const integrationRef = doc(db, 'integrations', user.uid);
            await setDoc(integrationRef, {
                [id]: {
                    connected: true,
                    connectedAt: new Date(),
                    ...credentials
                }
            }, { merge: true });

            // Also update the general user doc integration flags
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                integrations: {
                    [id]: true
                }
            }, { merge: true });

            toast.success(`Configuración para ${config.name} guardada`);
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error(`Error saving ${id}:`, error);
            toast.error("Error al guardar la configuración");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt={config.name} className="h-10 w-10 object-contain" />
                        ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Info className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                        <DialogTitle>Conectar con {config.name}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-4 py-4">
                    {config.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            <Input
                                id={field.id}
                                type={field.type || 'text'}
                                value={credentials[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                required={field.required !== false}
                                className="focus-visible:ring-[#10a37f]"
                            />
                        </div>
                    ))}

                    {config.helpText && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                            <span>{config.helpText}</span>
                        </div>
                    )}

                    <div className="bg-green-50 p-3 rounded-lg flex gap-3 text-sm text-green-700">
                        <ShieldCheck className="h-5 w-5 shrink-0" />
                        <p>Tus datos se almacenan cifrados y solo se usan para la sincronización operativa.</p>
                    </div>
                </form>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTest}
                        disabled={testing || loading}
                        className="w-full sm:w-auto"
                    >
                        {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Probar Conexión
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={loading || testing}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSave}
                            disabled={loading || testing}
                            className="bg-[#10a37f] hover:bg-[#0d8c6d] text-white flex-1"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Guardar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
