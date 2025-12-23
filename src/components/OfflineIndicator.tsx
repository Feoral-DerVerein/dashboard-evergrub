import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success("Conexión restablecida", {
                description: "Tus datos se están sincronizando con la nube."
            });
        };
        const handleOffline = () => {
            setIsOffline(true);
            toast.warning("Modo Offline activo", {
                description: "Puedes seguir trabajando. Los cambios se guardarán localmente."
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-20 right-6 z-50 animate-bounce">
            <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1.5 shadow-lg border-2 border-white">
                <WifiOff className="w-4 h-4" />
                <span>Modo Offline</span>
            </Badge>
        </div>
    );
}
