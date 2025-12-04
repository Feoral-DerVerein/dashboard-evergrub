import { AladdinChatPanel } from "@/components/ai/AladdinChatPanel"

const AladdinAI = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Food Aladdin AI Assistant</h1>
                    <p className="text-gray-600 mt-2">
                        Pregúntale cualquier cosa sobre tu inventario, ventas, donaciones y compliance con Ley 1/2025
                    </p>
                </div>

                <AladdinChatPanel />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-sm mb-2">💡 Ejemplo:</h3>
                        <p className="text-sm text-gray-600">
                            "¿Qué items están en riesgo de expirar esta semana?"
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-sm mb-2">📊 Ejemplo:</h3>
                        <p className="text-sm text-gray-600">
                            "¿Cómo van mis donaciones este mes vs el objetivo legal?"
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-sm mb-2">📄 Ejemplo:</h3>
                        <p className="text-sm text-gray-600">
                            "Genera el plan de prevención para enviar a las autoridades"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AladdinAI
