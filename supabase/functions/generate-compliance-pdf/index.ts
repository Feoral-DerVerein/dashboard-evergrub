import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportRequest {
    reportType: 'spain_ley1_2025' | 'australia_epa' | 'prevention_plan_spain' | 'general';
    tenantId: string;
    startDate: string;
    endDate: string;
    businessName?: string;
    businessAddress?: string;
}

interface ComplianceStats {
    totalWasteKg: number;
    totalDonatedKg: number;
    totalSurplus: number;
    donationPercentage: number;
    wasteByReason: Record<string, number>;
    donationsByRecipient: Record<string, number>;
}

async function getComplianceStats(
    supabase: any,
    tenantId: string,
    startDate: string,
    endDate: string
): Promise<ComplianceStats> {
    // Get waste logs
    const { data: wasteLogs } = await supabase
        .from('waste_logs')
        .select('quantity_kg, reason')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    const totalWasteKg = wasteLogs?.reduce((sum: number, log: any) => sum + (log.quantity_kg || 0), 0) || 0;

    const wasteByReason: Record<string, number> = {};
    wasteLogs?.forEach((log: any) => {
        const reason = log.reason || 'Sin especificar';
        wasteByReason[reason] = (wasteByReason[reason] || 0) + (log.quantity_kg || 0);
    });

    // Get donations
    const { data: donations } = await supabase
        .from('donations')
        .select('quantity_kg, status, recipient_name')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'delivered');

    const totalDonatedKg = donations?.reduce((sum: number, d: any) => sum + (d.quantity_kg || 0), 0) || 0;

    const donationsByRecipient: Record<string, number> = {};
    donations?.forEach((d: any) => {
        const recipient = d.recipient_name || 'ONG Sin nombre';
        donationsByRecipient[recipient] = (donationsByRecipient[recipient] || 0) + (d.quantity_kg || 0);
    });

    const totalSurplus = totalWasteKg + totalDonatedKg;
    const donationPercentage = totalSurplus > 0 ? (totalDonatedKg / totalSurplus) * 100 : 0;

    return {
        totalWasteKg,
        totalDonatedKg,
        totalSurplus,
        donationPercentage,
        wasteByReason,
        donationsByRecipient
    };
}

function generateSpainReport(
    stats: ComplianceStats,
    businessName: string,
    startDate: string,
    endDate: string
): string {
    const reportDate = new Date().toLocaleDateString('es-ES');
    const isCompliant = stats.donationPercentage >= 20;

    const wasteReasons = Object.entries(stats.wasteByReason)
        .map(([reason, kg]) => `• ${reason}: ${kg.toFixed(1)} kg`)
        .join('\n') || '• Sin registros';

    const donationRecipients = Object.entries(stats.donationsByRecipient)
        .map(([recipient, kg]) => `• ${recipient}: ${kg.toFixed(1)} kg`)
        .join('\n') || '• Sin donaciones registradas';

    return `
================================================================================
                    INFORME DE CUMPLIMIENTO LEY 1/2025
                    PREVENCIÓN Y REDUCCIÓN DE PÉRDIDAS
                         Y DESPERDICIO ALIMENTARIO
================================================================================

Fecha de Generación: ${reportDate}
Período del Informe: ${startDate} - ${endDate}

--------------------------------------------------------------------------------
1. DATOS DEL ESTABLECIMIENTO
--------------------------------------------------------------------------------
Nombre: ${businessName || 'No especificado'}
Tipo de Actividad: Establecimiento alimentario

--------------------------------------------------------------------------------
2. RESUMEN EJECUTIVO
--------------------------------------------------------------------------------
Excedentes Totales Generados: ${stats.totalSurplus.toFixed(1)} kg
   • Donados: ${stats.totalDonatedKg.toFixed(1)} kg (${stats.donationPercentage.toFixed(1)}%)
   • Desperdiciados: ${stats.totalWasteKg.toFixed(1)} kg

Estado de Cumplimiento: ${isCompliant ? 'CUMPLE ✓' : 'NO CUMPLE ✗'}
${!isCompliant ? `
ADVERTENCIA: El porcentaje de donación (${stats.donationPercentage.toFixed(1)}%) está por
debajo del objetivo recomendado del 20%.
` : ''}

--------------------------------------------------------------------------------
3. DETALLE DE DONACIONES
--------------------------------------------------------------------------------
${donationRecipients}

Total Donado: ${stats.totalDonatedKg.toFixed(1)} kg

--------------------------------------------------------------------------------
4. DETALLE DE DESPERDICIOS
--------------------------------------------------------------------------------
${wasteReasons}

Total Desperdiciado: ${stats.totalWasteKg.toFixed(1)} kg

--------------------------------------------------------------------------------
5. ANÁLISIS DE CUMPLIMIENTO
--------------------------------------------------------------------------------
Según la Ley 1/2025 de Prevención de Pérdidas y Desperdicio Alimentario:

• Artículo 5.1: Obligación de jerarquía de prioridades para excedentes
  - Prioridad 1: Donación para consumo humano
  - Prioridad 2: Transformación
  - Prioridad 3: Alimentación animal
  - Prioridad 4: Otros fines

• Estado actual: ${isCompliant ?
            'El establecimiento cumple con las obligaciones de donación prioritaria.' :
            'Se recomienda incrementar las donaciones para cumplir con la normativa.'}

--------------------------------------------------------------------------------
6. RECOMENDACIONES
--------------------------------------------------------------------------------
${isCompliant ? `
• Mantener las buenas prácticas de donación actuales
• Continuar colaborando con entidades receptoras
• Documentar todas las donaciones realizadas
` : `
• URGENTE: Establecer acuerdos con bancos de alimentos u ONGs
• Revisar procesos de gestión de excedentes
• Implementar sistema de alertas de caducidad
• Contactar con Ministerio para asesoramiento
`}

--------------------------------------------------------------------------------
7. DECLARACIÓN
--------------------------------------------------------------------------------
Este informe ha sido generado automáticamente por el sistema Negentropy AI
conforme a los requisitos de la Ley 1/2025.

Firma digital: _______________________
Fecha: ${reportDate}

================================================================================
                         FIN DEL INFORME
================================================================================
  `.trim();
}

// ... existing generateAustraliaReport ...

function generatePreventionPlanSpain(
    stats: ComplianceStats,
    businessName: string
): string {
    const reportDate = new Date().toLocaleDateString('es-ES');
    const nextReviewDate = new Date();
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

    return `
================================================================================
          PLAN DE PREVENCIÓN DE PÉRDIDAS Y DESPERDICIO ALIMENTARIO
                          Ley 1/2025 (España)
================================================================================

Empresa: ${businessName || 'No especificado'}
Fecha de Aprobación: ${reportDate}
Próxima Revisión: ${nextReviewDate.toLocaleDateString('es-ES')}

--------------------------------------------------------------------------------
1. DIAGNÓSTICO INICIAL (Auto-evaluación)
--------------------------------------------------------------------------------
Basado en el análisis de datos históricos de Negentropy AI:

• Puntos Críticos de Desperdicio Identificados:
${Object.entries(stats.wasteByReason).map(([r, v]) => `  - ${r}: ${v.toFixed(1)}kg detectados`).join('\n') || '  - Pendiente de recolección de datos'}

• Volumen Actual de Excedentes: ${stats.totalSurplus.toFixed(1)} kg / periodo
• Tasa de Aprovechamiento Actual: ${stats.donationPercentage.toFixed(1)}%

--------------------------------------------------------------------------------
2. OBJETIVOS ESTRATÉGICOS
--------------------------------------------------------------------------------
Conforme a la Ley 1/2025, el establecimiento se compromete a:

1. Reducción Cuantitativa:
   - Reducir el desperdicio total en un 20% para el próximo año.
   - Objetivo: < ${(stats.totalWasteKg * 0.8).toFixed(1)} kg de merma.

2. Mejora de Gestión:
   - Implementar sistema de IA (Negentropy) para ajustar pedidos.
   - Alcanzar un 90% de donación efectiva de excedentes aptos.

--------------------------------------------------------------------------------
3. JERARQUÍA DE PRIORIDADES (Artículo 5)
--------------------------------------------------------------------------------
Se aplicará el siguiente orden de prioridad para el destino de alimentos:

1. CONSUMO HUMANO (Prioridad Máxima)
   - Venta con descuento de productos "feos" o próximos a caducar.
   - Donación a Bancos de Alimentos (ver convenios en Anexo).

2. TRANSFORMACIÓN
   - Elaboración de otros productos (mermeladas, jugos, salsas).

3. ALIMENTACIÓN ANIMAL
   - Acuerdos con protectoras o granjas certificadas.

4. COMPOSTAJE / BIOGÁS (Último recurso)

--------------------------------------------------------------------------------
4. PROGRAMA DE FORMACIÓN
--------------------------------------------------------------------------------
- Todos los empleados recibirán formación sobre:
  • Correcta separación de residuos.
  • Uso del software de predicción de demanda.
  • Protocolo de donaciones seguras.

--------------------------------------------------------------------------------
5. SEGUIMIENTO Y EVALUACIÓN
--------------------------------------------------------------------------------
Este plan será revisado anualmente. Se utilizará el cuadro de mando
"Negentropy Compliance Hub" para el monitoreo mensual de indicadores.

Firma de la Dirección: ____________________
`.trim();
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const request: ReportRequest = await req.json()
        const { reportType, tenantId, startDate, endDate, businessName } = request

        const stats = await getComplianceStats(supabase, tenantId, startDate, endDate)

        let reportContent = ''
        let reportTitle = 'Informe'

        switch (reportType) {
            case 'spain_ley1_2025':
                reportContent = generateSpainReport(stats, businessName || '', startDate, endDate)
                reportTitle = 'Informe_Ley1_2025'
                break
            case 'prevention_plan_spain':
                reportContent = generatePreventionPlanSpain(stats, businessName || '')
                reportTitle = 'Plan_Prevencion_Desperdicio'
                break
            case 'australia_epa':
                reportContent = "Reporte NSW EPA - Pendiente de implementación."
                reportTitle = 'NSW_EPA_Compliance'
                break
            default:
                reportContent = "Tipo de reporte no reconocido."
        }

        return new Response(
            JSON.stringify({
                success: true,
                report: reportContent,
                title: reportTitle,
                stats
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
