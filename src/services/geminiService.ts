import { model } from "@/lib/gemini";
import { dashboardAnalyticsService } from "@/services/dashboardAnalyticsService";
import { donationService } from "@/services/donationService";
import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc
} from "firebase/firestore";

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: any; // Can be Date or Firestore Timestamp
}

export interface ChatResponse {
    text: string;
    component?: {
        type: 'product_card' | 'action_card' | 'chart_card';
        data: any;
    };
}

export const geminiService = {
    async loadChatHistory(userId: string): Promise<ChatMessage[]> {
        try {
            const chatRef = collection(db, "negentropy_chats");
            const q = query(
                chatRef,
                where("userId", "==", userId),
                orderBy("timestamp", "asc"),
                limit(50)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    role: data.role,
                    text: data.text,
                    timestamp: data.timestamp?.toDate() || new Date()
                };
            });
        } catch (error) {
            console.error("Error loading chat history:", error);
            return [];
        }
    },

    async saveMessage(userId: string, message: Partial<ChatMessage>) {
        try {
            await addDoc(collection(db, "negentropy_chats"), {
                userId,
                role: message.role,
                text: message.text,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    },

    async sendMessage(history: ChatMessage[], message: string, userId?: string): Promise<ChatResponse> {
        try {
            // Save user message if userId is provided
            if (userId) {
                this.saveMessage(userId, { role: 'user', text: message });
            }

            // Convert history to Gemini format
            const chatHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            let context = "";
            const lowerMsg = message.toLowerCase();

            // Basic RAG
            if (lowerMsg.includes('dashboard') || lowerMsg.includes('sales') || lowerMsg.includes('ventas')) {
                const analytics = await dashboardAnalyticsService.fetchDashboardAnalytics();
                context += `\n[System Data: Total Sales $${analytics.totalSales}, Transactions: ${analytics.totalTransactions}, Top: ${analytics.topSellingProduct}]`;
            }

            // Products RAG + GenUI Trigger
            if (lowerMsg.includes('producto') || lowerMsg.includes('product') || lowerMsg.includes('stock')) {
                context += `\n[System Data: Available Products: Organic Avocados (ID: prod_1), Sourdough Bread (ID: prod_2). If user asks for details of a specific product, reply with the details AND append the token [SHOW_PRODUCT: <id>] at the end.]`;
            }

            if (lowerMsg.includes('discount') || lowerMsg.includes('descuento')) {
                context += `\n[System Data: You can offer a discount. If the user accepts or asks to apply, append [SHOW_ACTION: discount_50] for 50% off.]`;
            }

            if (lowerMsg.includes('donation') || lowerMsg.includes('donar') || lowerMsg.includes('ong')) {
                const candidates = await donationService.getCandidates(userId || 'demo-user');
                const candidateNames = candidates.map(c => c.name).join(', ');
                context += `\n[Context: Products available for donation: ${candidateNames}]`;
            }

            if (lowerMsg.includes('graph') || lowerMsg.includes('chart') || lowerMsg.includes('trend') || lowerMsg.includes('grafico') || lowerMsg.includes('tendencia')) {
                context += `\n[System Data: If user asks for visuals, you can reply with [SHOW_CHART: <type>]. Types: 'sales_trend' (for revenue/sales), 'demand_forecast' (for future demand), 'waste_reduction' (for savings). Example: "Here is your sales trend: [SHOW_CHART: sales_trend]"]`;
            }

            const result = await chat.sendMessage(message + context);
            const responseText = result.response.text();

            // Save model response if userId is provided
            if (userId) {
                this.saveMessage(userId, { role: 'model', text: responseText });
            }

            // Parse Generative UI Token
            const productMatch = responseText.match(/\[SHOW_PRODUCT:\s*([^\]]+)\]/);
            const actionMatch = responseText.match(/\[SHOW_ACTION:\s*([^\]]+)\]/);

            if (productMatch) {
                const productId = productMatch[1];
                const cleanText = responseText.replace(productMatch[0], '').trim();

                const productData = {
                    id: productId,
                    name: productId === 'prod_1' ? 'Organic Avocados' : 'Sourdough Bread',
                    price: productId === 'prod_1' ? 4.99 : 3.50,
                    stock: productId === 'prod_1' ? 15 : 8,
                    expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                    discount: 30,
                    imageUrl: "https://images.unsplash.com/photo-1590004987778-bece5c9adab6?q=80&w=260"
                };

                return {
                    text: cleanText,
                    component: {
                        type: 'product_card',
                        data: productData
                    }
                };
            }

            if (actionMatch) {
                const actionId = actionMatch[1];
                const cleanText = responseText.replace(actionMatch[0], '').trim();

                // Advanced parsing of action tokens: [SHOW_ACTION: discount|prod_id|prod_name|value]
                const [type, productId, productName, value, target] = actionId.split('|');

                const actionData = {
                    type: type === 'discount' ? 'discount' : 'donation',
                    title: type === 'discount' ? `Aplicar Descuento ${value || '30'}%` : `Confirmar Donación`,
                    description: type === 'discount'
                        ? `Aplicar un descuento dinámico a ${productName || 'este producto'} para evitar desperdicio.`
                        : `Donar ${value || 'unidades'} de ${productName || 'producto'} a ${target || 'donación'}.`,
                    actionLabel: type === 'discount' ? 'Aplicar Ahora' : 'Confirmar Donación',
                    actionValue: actionId, // Keep original for back-compat or detailed parsing
                    // Metadata for executor
                    productId,
                    productName,
                    value: parseFloat(value || "0"),
                    target
                };

                return {
                    text: cleanText,
                    component: {
                        type: 'action_card',
                        data: actionData
                    }
                };
            }

            const chartMatch = responseText.match(/\[SHOW_CHART:\s*([^\]]+)\]/);

            if (chartMatch) {
                const chartType = chartMatch[1].trim();
                const cleanText = responseText.replace(chartMatch[0], '').trim();
                let chartData = null;

                if (chartType.includes('sales') || chartType.includes('revenue')) {
                    chartData = {
                        title: "Weekly Revenue Trend",
                        type: 'line',
                        color: '#6366f1',
                        description: "Revenue has increased by 15% this week.",
                        dataKey: 'revenue',
                        categoryKey: 'day',
                        data: [
                            { day: 'Mon', revenue: 1200 },
                            { day: 'Tue', revenue: 1350 },
                            { day: 'Wed', revenue: 1250 },
                            { day: 'Thu', revenue: 1500 },
                            { day: 'Fri', revenue: 1800 },
                            { day: 'Sat', revenue: 2100 },
                            { day: 'Sun', revenue: 1900 },
                        ]
                    };
                } else if (chartType.includes('forecast') || chartType.includes('demand')) {
                    chartData = {
                        title: "Demand Forecast (Next 7 Days)",
                        type: 'bar',
                        color: '#f59e0b',
                        description: "High demand expected on weekend.",
                        dataKey: 'demand',
                        categoryKey: 'day',
                        data: [
                            { day: 'Mon', demand: 80 },
                            { day: 'Tue', demand: 90 },
                            { day: 'Wed', demand: 85 },
                            { day: 'Thu', demand: 110 },
                            { day: 'Fri', demand: 140 },
                            { day: 'Sat', demand: 160 },
                            { day: 'Sun', demand: 130 },
                        ]
                    };
                } else if (chartType.includes('waste') || chartType.includes('savings')) {
                    chartData = {
                        title: "Waste Reduction Impact",
                        type: 'area',
                        color: '#10b981',
                        description: "Cumulative savings in kg.",
                        dataKey: 'saved',
                        categoryKey: 'week',
                        data: [
                            { week: 'W1', saved: 10 },
                            { week: 'W2', saved: 25 },
                            { week: 'W3', saved: 45 },
                            { week: 'W4', saved: 70 },
                        ]
                    };
                }

                if (chartData) {
                    return {
                        text: cleanText,
                        component: {
                            type: 'chart_card',
                            data: chartData
                        }
                    };
                }
            }

            return { text: responseText };

        } catch (error: any) {
            console.error("Gemini Chat Error:", error);
            return { text: `Lo siento, tuve un problema técnico: ${error.message || error}` };
        }
    },

    /**
     * Proactive Onboarding Analysis
     * Triggered after a data import to provide immediate value.
     */
    async generateOnboardingAnalysis(userId: string, data: any[], type: string): Promise<void> {
        try {
            if (type !== 'products' || data.length === 0) return;

            // Prepare a mini-sample for Gemini to analyze
            const sample = data.slice(0, 10).map(p => ({
                name: p.nombre || p.name || p.producto,
                qty: p.cantidad || p.quantity || p.stock,
                exp: p.fecha_expiracion || p.expiration_date || p.expiry_date
            }));

            const prompt = `
                Actúa como Negentropy AI, el asistente virtual experto. 
                El usuario acaba de importar ${data.length} productos a su inventario.
                Aquí tienes una muestra de los datos: ${JSON.stringify(sample)}.
                
                Tu tarea:
                1. Saluda efusivamente al usuario dándole la bienvenida a la plataforma.
                2. Menciona la cantidad total de productos importados.
                3. Haz un análisis rápido: si ves fechas próximas (en 2024 o 2025 pronto), avisa sobre el riesgo de desperdicio.
                4. Ofrece ayuda para optimizar los precios o donar los excedentes.
                
                Mantén un tono profesional, experto pero cercano (de "tú"). 
                Usa Markdown para negritas y listas.
                Si detectas productos específicos con stock bajo o caducidad próxima, menciónalos.
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Save as a model message so it appears in the chat history
            await this.saveMessage(userId, {
                role: 'model',
                text: responseText
            });

            console.log("🪄 Negentropy proactive greeting generated and saved.");
        } catch (error) {
            console.error("Error generating onboarding analysis:", error);
        }
    }
};
