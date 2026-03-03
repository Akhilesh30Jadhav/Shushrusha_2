"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SessionData {
    id: string;
    scenario_id: string;
    language: string;
    started_at: string;
    completed_at_optional: string | null;
    score_optional: number | null;
    scenario: {
        title: string;
        category: string;
    };
}

export default function HistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sessions/history?limit=15')
            .then(res => res.json())
            .then(data => {
                if (data.sessions) setSessions(data.sessions);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <main className="relative min-h-screen bg-black overflow-x-hidden flex flex-col p-6">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="z-10 flex items-center mb-8">
                <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors mr-4">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-2xl font-bold flex items-center text-white">
                    <Clock className="w-6 h-6 mr-3 text-pink-500" />
                    Training History
                </h1>
            </header>

            {/* Main Content */}
            <div className="z-10 max-w-3xl mx-auto w-full">
                {loading ? (
                    <div className="text-center text-zinc-500 animate-pulse py-20">Loading history...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center bg-zinc-950 border border-white/5 rounded-3xl py-20 px-6">
                        <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-white mb-2">No past sessions found</h2>
                        <p className="text-zinc-500 mb-6">Complete a scenario to see your evaluation history here.</p>
                        <Link href="/languages" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-medium">
                            Start a Scenario
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => router.push(`/session/${session.id}${session.completed_at_optional ? '/report' : ''}`)}
                                className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-zinc-950 border border-white/10 hover:border-violet-500/50 rounded-2xl transition-colors group text-left"
                            >
                                <div className="flex-1 mb-4 sm:mb-0">
                                    <h3 className="text-lg font-bold text-white mb-1">{session.scenario.title}</h3>
                                    <div className="flex items-center text-xs text-zinc-500 space-x-3">
                                        <span className="bg-white/5 px-2 py-1 rounded">{session.scenario.category}</span>
                                        <span>{formatDate(session.started_at)}</span>
                                        <span className="uppercase">{session.language}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs text-zinc-500 mb-1">Score</div>
                                        {session.completed_at_optional ? (
                                            <div className={`text-xl font-bold ${session.score_optional! >= 80 ? 'text-emerald-400' : session.score_optional! >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {session.score_optional}%
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold bg-yellow-500/20 text-yellow-500 rounded-md">
                                                Incomplete
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-violet-500 flex items-center justify-center transition-colors">
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
