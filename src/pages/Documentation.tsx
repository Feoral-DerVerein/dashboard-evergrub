import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Code, Shield, Network, Zap, BookOpen, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Documentation() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t('documentation.title')}</h1>
                <p className="text-gray-500">
                    {t('documentation.subtitle')}
                </p>
            </div>

            <Tabs defaultValue="user-guide" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="user-guide" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {t('documentation.tabs.user_guide')}
                    </TabsTrigger>
                    <TabsTrigger value="api-reference" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        {t('documentation.tabs.api_reference')}
                    </TabsTrigger>
                    <TabsTrigger value="legal" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Legal
                    </TabsTrigger>
                </TabsList>

                {/* User Guide Content */}
                <TabsContent value="user-guide" className="mt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Compliance Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    Compliance & Reporting
                                </CardTitle>
                                <CardDescription>
                                    How to generate legal reports for Ley 1/2025.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Generate Reports</h3>
                                    <p className="text-sm text-gray-600">
                                        Navigate to the <strong>Compliance Hub</strong> or <strong>Dashboard</strong> and click "Generate Report".
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                        <li>
                                            <strong>Compliance Report (Ley 1/2025)</strong>: Use this to audits. It checks if your donation rate is &gt;20%.
                                        </li>
                                        <li>
                                            <strong>Prevention Plan</strong>: Strategic document required by law.
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scenarios Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Network className="h-5 w-5 text-purple-600" />
                                    Scenario Planning
                                </CardTitle>
                                <CardDescription>
                                    Using "What-if" analysis for forecasting.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Switching Scenarios</h3>
                                    <p className="text-sm text-gray-600">
                                        On the Dashboard header, use the scenario dropdown:
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                        <li><strong>Base</strong>: Standard AI prediction based on history.</li>
                                        <li><strong>Optimistic</strong>: Assumes 20% growth. Good for planning expansions.</li>
                                        <li><strong>Crisis</strong>: Assumes 30% drop. Useful for risk management.</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prescriptive Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-600" />
                                    Prescriptive Actions
                                </CardTitle>
                                <CardDescription>
                                    AI-driven actionable recommendations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    The dashboard analyzes your active scenario and suggests concrete actions (e.g., "Liquidate Stock", "Order More") to maximize profit or minimize waste.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* API Reference Content */}
                <TabsContent value="api-reference" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edge Functions Reference</CardTitle>
                            <CardDescription>
                                Technical documentation for Negentropy AI's serverless functions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                                <div className="space-y-8">

                                    {/* generate-compliance-pdf */}
                                    <div className="space-y-4">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-lg font-bold font-mono text-blue-700">POST /generate-compliance-pdf</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Authenticated</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Generates a PDF compliance report or prevention plan based on tenant data.
                                        </p>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
                                            {`{
  "reportType": "spain_ley1_2025" | "prevention_plan_spain" | "australia_epa",
  "tenantId": "uuid",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "businessName": "string"
}`}
                                        </div>
                                    </div>

                                    <hr />

                                    {/* generate-sales-predictions */}
                                    <div className="space-y-4">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-lg font-bold font-mono text-gray-500">POST /generate-sales-predictions (Deprecated/Mock)</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Authenticated</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Triggers AI forecasting engine. Can run in "simulation mode" for scenarios without persisting data.
                                        </p>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
                                            {`{
  "tenantId": "uuid",
  "weeksToPredict": 4, // default
  "scenario": "base" | "optimistic" | "crisis"
}`}
                                        </div>
                                    </div>

                                    <hr />

                                    {/* aladdin-ai */}
                                    <div className="space-y-4">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-lg font-bold font-mono text-blue-700">POST /negentropy-ai</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Public</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Chat interface endpoint. Accepts natural language and returns AI response with context awareness.
                                        </p>
                                    </div>


                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* Legal Documents Content */}
                <TabsContent value="legal" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Política de Privacidad (RGPD)</CardTitle>
                            <CardDescription>
                                Cumplimiento con el Reglamento General de Protección de Datos (UE 2016/679).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p><strong>1. Responsable del Tratamiento:</strong> Negentropy AI, S.L.</p>
                            <p><strong>2. Finalidad:</strong> Gestión de la plataforma de optimización de inventario y donaciones.</p>
                            <p><strong>3. Legitimación:</strong> Ejecución de contrato y cumplimiento de obligaciones legales (Ley 1/2025).</p>
                            <p><strong>4. Destinatarios:</strong> No se cederán datos a terceros, salvo obligación legal o a entidades benéficas (Fesbal) bajo instrucción del usuario.</p>
                            <p><strong>5. Derechos:</strong> Acceder, rectificar y suprimir los datos, así como otros derechos, enviando un correo a privacy@negentropy.ai.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Términos de Servicio</CardTitle>
                            <CardDescription>Condiciones de uso de la plataforma Negentropy AI.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-700">
                            <p>
                                El uso de esta plataforma implica la aceptación de que las predicciones de IA son herramientas de soporte a la decisión y no garantías de resultados futuros.
                                El usuario es responsable de la veracidad de los datos de inventario introducidos.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Licencia de uso no exclusiva e intransferible.</li>
                                <li>SLA garantizado del 99.5% para clientes Enterprise.</li>
                                <li>Propiedad de los datos: El cliente conserva total propiedad sobre sus datos comerciales.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contrato SaaS Estándar</CardTitle>
                            <CardDescription>Acuerdo marco de prestación de servicios en la nube.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-gray-50 text-xs font-mono text-gray-600">
                                <p className="mb-2"><strong>CLÁUSULA PRIMERA: OBJETO</strong></p>
                                <p className="mb-4">Por el presente contrato, el PROVEEDOR presta al CLIENTE el servicio de software "Negentropy AI" en modalidad SaaS...</p>

                                <p className="mb-2"><strong>CLÁUSULA SEGUNDA: DURACIÓN</strong></p>
                                <p className="mb-4">El contrato tendrá una duración inicial de 12 meses, prorrogables automáticamente...</p>

                                <p className="mb-2"><strong>CLÁUSULA TERCERA: CONFIDENCIALIDAD</strong></p>
                                <p className="mb-4">Ambas partes se obligan a guardar estricta confidencialidad sobre la información técnica y comercial...</p>

                                <p className="mb-2"><strong>CLÁUSULA CUARTA: RESPONSABILIDAD</strong></p>
                                <p className="mb-4">La responsabilidad acumulada del PROVEEDOR no excederá el importe de las cuotas abonadas en los últimos 12 meses...</p>
                            </ScrollArea>
                            <div className="mt-4 flex justify-end">
                                <a href="#" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                    <FileText className="w-4 h-4" /> Descargar PDF completo
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
