import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Send } from "lucide-react";
import { ChatLoadingIndicator } from "@/components/chat/ChatLoadingIndicator";

export function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMsg = input;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    console.log("Sending to N8N:", userMsg);

    try {
      const response = await fetch("https://n8n.srv1024074.hstgr.cloud/webhook-test/fc7630b0-e2eb-44d0-957d-f55162b32271", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg,
          client_id: localStorage.getItem("client_id") || "test-client-123"
        })
      });

      const data = await response.json();
      console.log("N8N Response:", data);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        product_cards: data.product_cards
      }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-t-lg border border-gray-200 p-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Chat Bot</h1>
      </div>

      <div className="flex-1 bg-gray-50 border-x border-gray-200 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-4">
            {msg.role === "user" ? (
              <div className="bg-blue-600 text-white rounded-lg p-3 ml-auto max-w-md">
                {msg.content}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-2xl">
                  {msg.content}
                </div>

                {msg.product_cards && msg.product_cards.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      📦 Suggested Actions:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {msg.product_cards.map((product: any) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onEdit={(id) => console.log("Edit:", id)}
                          onDelete={(id) => console.log("Delete:", id)}
                          onSurpriseBag={(id) => console.log("Surprise Bag:", id)}
                          onMarketplace={(id) => console.log("Marketplace:", id)}
                          onDonation={(id) => console.log("Donation:", id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && <ChatLoadingIndicator />}
      </div>

      <div className="bg-white rounded-b-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your inventory..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
