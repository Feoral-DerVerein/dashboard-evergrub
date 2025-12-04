import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    metadata?: {
        provider?: string
        model?: string
        tokens?: number
        cost_usd?: number
    }
}

interface ActionableIntent {
    type: string
    label: string
    endpoint: string
}

export function AladdinChatPanel() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [contextSummary, setContextSummary] = useState<any>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    // Welcome message on mount
    useEffect(() => {
        setMessages([
            {
                role: 'assistant',
                content: '👋 ¡Hola! Soy **Negentropy Assistant**, tu asistente AI especializado en reducción de desperdicio y optimización de inventario.\n\nPuedo ayudarte con:\n- Analizar tu inventario actual y riesgos de expiración\n- Sugerir acciones para reducir pérdidas\n- Generar planes de prevención (Ley 1/2025)\n- Revisar tu performance de ventas y donaciones\n\n**Pregúntame algo**, por ejemplo:\n- "¿Cuánto desperdicio tengo actualmente?"\n- "¿Cómo puedo reducir pérdidas este mes?"\n- "Genera el plan de prevención de diciembre"',
                timestamp: new Date()
            }
        ])
    }, [])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('No estás autenticado')
                return
            }

            // Call Aladdin AI Edge Function
            const { data, error } = await supabase.functions.invoke('aladdin-ai/query', {
                body: {
                    query: input,
                    conversation_history: messages.slice(-4) // Last 2 exchanges for context
                }
            })

            if (error) throw error

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                metadata: data.metadata
            }

            setMessages((prev) => [...prev, assistantMessage])

            // Store context summary if provided
            if (data.context_used) {
                setContextSummary(data.context_used)
            }

            // Show actionable intents as toast
            if (data.actionable_intents && data.actionable_intents.length > 0) {
                data.actionable_intents.forEach((intent: ActionableIntent) => {
                    toast.success(intent.label, {
                        description: 'Haz clic para ejecutar esta acción',
                        action: {
                            label: 'Ir',
                            onClick: () => {
                                // Navigate to relevant page
                                window.location.href = '/legal' // Simplified
                            }
                        }
                    })
                })
            }

            // Log if fallback was used
            if (data.fallback) {
                toast.warning('El asistente AI no está disponible, usando modo básico')
            }

        } catch (error: any) {
            console.error('Aladdin AI error:', error)
            toast.error('Error al procesar tu pregunta')

            const errorMessage: Message = {
                role: 'assistant',
                content: '❌ Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
                timestamp: new Date()
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Card className="flex flex-col h-[600px]">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-purple-600" />
                        <div>
                            <CardTitle>Negentropy Assistant</CardTitle>
                            <CardDescription>Tu asistente inteligente para gestión de inventario</CardDescription>
                        </div>
                    </div>
                    {contextSummary && (
                        <div className="flex gap-2">
                            <Badge variant="outline">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {contextSummary.inventory_items} items
                            </Badge>
                            {contextSummary.critical_items > 0 && (
                                <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {contextSummary.critical_items} en riesgo
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${message.role === 'user'
                                        ? 'bg-blue-600'
                                        : 'bg-purple-600'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`flex flex-col gap-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'
                                        }`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-2 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {message.content}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                        {message.metadata && (
                                            <>
                                                <span>•</span>
                                                <span>{message.metadata.model}</span>
                                                {message.metadata.tokens && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{message.metadata.tokens} tokens</span>
                                                    </>
                                                )}
                                                {message.metadata.cost_usd && (
                                                    <>
                                                        <span>•</span>
                                                        <span>${message.metadata.cost_usd.toFixed(4)}</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-purple-600">
                                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="h-2 w-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span>Pensando...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Pregúntame sobre tu inventario, ventas, o compliance..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            size="icon"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Presiona Enter para enviar • Shift+Enter para nueva línea
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
