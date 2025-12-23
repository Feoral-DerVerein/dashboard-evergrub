import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Euro, Package, TrendingUp } from "lucide-react";

export function ImpactMonitorWidget() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({
        co2Saved: 0,
        economicValue: 0,
        totalItems: 0,
        donationsCount: 0
    });

    useEffect(() => {
        if (!user?.uid) return;

        const donationsRef = collection(db, "donations");
        const q = query(donationsRef, where("tenant_id", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let co2 = 0;
            let economic = 0;
            let items = 0;
            let count = snapshot.size;

            snapshot.forEach((doc) => {
                const data = doc.data();
                co2 += data.impact?.co2_saved || 0;
                economic += data.impact?.economic_value || 0;
                items += data.quantity || 0;
            });

            setMetrics({
                co2Saved: co2,
                economicValue: economic,
                totalItems: items,
                donationsCount: count
            });
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-[-10px] right-[-10px] opacity-10">
                <Leaf className="w-24 h-24 text-green-600 rotate-12" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-4 h-4" />
                    Monitor de Impacto en Tiempo Real
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-green-700 font-medium uppercase tracking-wider">CO2 Ahorrado</p>
                        <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-green-600" />
                            <span className="text-2xl font-bold text-green-900 animate-in fade-in zoom-in duration-500">
                                {metrics.co2Saved.toFixed(1)} <span className="text-xs font-normal">kg</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] text-green-700 font-medium uppercase tracking-wider">Valor Recuperado</p>
                        <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-green-600" />
                            <span className="text-2xl font-bold text-green-900 animate-in fade-in zoom-in duration-500">
                                {metrics.economicValue.toFixed(0)}<span className="text-xs font-normal">€</span>
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-green-100 mt-2">
                        <div className="flex justify-between items-center text-[10px] text-green-600">
                            <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                <span>{metrics.totalItems} productos salvados</span>
                            </div>
                            <div className="bg-green-200/50 px-2 py-0.5 rounded-full">
                                {metrics.donationsCount} donaciones este mes
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
