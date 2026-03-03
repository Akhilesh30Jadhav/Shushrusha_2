"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Activity, User, Mic } from "lucide-react";

interface Message {
    role: 'patient' | 'worker';
    text: string;
    node_key?: string;
    evaluation?: {
        notes: string;
        critical_missed: any[];
    }
}

export default function SessionPlayerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [currentNodeKey, setCurrentNodeKey] = useState("start");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchNode = async (key: string) => {
        const res = await fetch(`/api/sessions/${id}/node?key=${key}`);
        if (res.ok) {
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'patient', text: data.patient_text, node_key: key }]);
        }
    };

    useEffect(() => {
        // Initial fetch for the 'start' node
        fetchNode("start");
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'worker', text: userText }]);
        setLoading(true);

        try {
            const res = await fetch(`/api/sessions/${id}/turn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ node_key: currentNodeKey, user_text: userText })
            });

            if (res.ok) {
                const data = await res.json();
                const { next_node_key, evaluation } = data;

                // Optionally, update the last worker message with evaluation result
                setMessages(prev => {
                    const newArr = [...prev];
                    const lastMsg = newArr[newArr.length - 1];
                    if (lastMsg && lastMsg.role === 'worker') {
                        lastMsg.evaluation = evaluation;
                    }
                    return newArr;
                });

                if (next_node_key) {
                    setCurrentNodeKey(next_node_key);
                    await fetchNode(next_node_key);
                } else {
                    // If no next_node_key, scenario might be finished or ending node reached.
                    // Wait briefly, then go to report
                    setTimeout(() => {
                        router.push(`/session/${id}/report`);
                    }, 1500);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950">
                <div className="flex items-center text-pink-500 font-bold">
                    <Activity className="w-5 h-5 mr-2" />
                    SESSION {id?.toString().substring(0, 6).toUpperCase()}
                </div>
                <button
                    onClick={() => router.push(`/session/${id}/report`)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                    End Session
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'worker' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'worker' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'worker' ? 'bg-violet-600' : 'bg-pink-600'}`}>
                                <User className="w-5 h-5 text-white" />
                            </div>

                            {/* Message Bubble */}
                            <div className={`p-4 rounded-2xl ${msg.role === 'worker' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>

                        {/* Evaluation Indicator (Worker only) */}
                        {msg.role === 'worker' && msg.evaluation && (
                            <div className="mt-2 text-xs mr-10 flex gap-2">
                                {msg.evaluation.critical_missed.length > 0 ? (
                                    <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md">Critical Miss Detected!</span>
                                ) : (
                                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">Protocol Matched</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm ml-10">
                        <span className="animate-pulse">Patient is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-white/10">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your response to the patient..."
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-full py-3 px-5 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="p-3 bg-zinc-800 rounded-full hover:bg-zinc-700 transition"
                        title="Voice recording (Optional / Future Feature)"
                    >
                        <Mic className="w-5 h-5 text-zinc-400" />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="p-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full hover:opacity-90 transition disabled:opacity-50"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </main>
    );
}
