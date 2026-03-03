"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, AlertTriangle, CheckCircle, Home, ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import Link from "next/link";

interface ReportData {
    score: number;
    checklist_results: any[];
    critical_misses: any[];
    suggestions: string[];
}

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/sessions/${id}/complete`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.report) setReport(data.report);
                setLoading(false);
            });
    }, [id]);

    return (
        <main className="relative min-h-screen bg-black overflow-x-hidden flex flex-col p-6">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="z-10 flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center text-white">
                    <Activity className="w-8 h-8 mr-3 text-pink-500" />
                    Session Report
                </h1>
                <div className="flex gap-4">
                    <Link href="/history" className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition">
                        View History
                    </Link>
                    <Link href="/" className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition flex items-center">
                        <Home className="w-4 h-4 mr-2" /> Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="z-10 max-w-4xl mx-auto w-full space-y-8">
                {loading ? (
                    <div className="text-center text-zinc-500 animate-pulse py-20">Evaluating protocol adherence...</div>
                ) : !report ? (
                    <div className="text-center text-red-500 py-20">Failed to load report.</div>
                ) : (
                    <>
                        {/* Score & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Score Card */}
                            <div className="md:col-span-1 p-8 bg-zinc-950 border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                                <div className={`absolute -bottom-10 -right-10 w-40 h-40 blur-3xl opacity-50 rounded-full ${report.score >= 80 ? 'bg-emerald-500' : report.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                <h2 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">Protocol Score</h2>
                                <div className="text-7xl font-black text-white">{report.score}<span className="text-3xl text-zinc-500">%</span></div>
                            </div>

                            {/* Suggestions */}
                            <div className="md:col-span-2 p-8 bg-zinc-950 border border-white/10 rounded-3xl flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    Feedback & Suggestions
                                </h3>
                                <ul className="space-y-3">
                                    {report.suggestions.map((s, i) => (
                                        <li key={i} className="flex text-zinc-300">
                                            <span className="text-pink-500 mr-3">•</span> {s}
                                        </li>
                                    ))}
                                    {report.suggestions.length === 0 && (
                                        <li className="text-zinc-500 italic">No specific feedback recorded.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Critical Misses */}
                        {report.critical_misses.length > 0 && (
                            <div className="p-6 bg-red-950/20 border border-red-500/50 rounded-2xl">
                                <h3 className="text-red-400 font-bold flex items-center mb-4">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Critical Danger Signs Missed
                                </h3>
                                <ul className="space-y-2">
                                    {report.critical_misses.map((m, i) => (
                                        <li key={i} className="text-red-300 text-sm px-4 py-2 bg-red-500/10 rounded-lg">
                                            {m.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Detailed Checklist */}
                        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 overflow-hidden">
                            <h3 className="text-white font-bold text-lg mb-6">Evaluation Checklist</h3>
                            <div className="space-y-3">
                                {report.checklist_results.length === 0 ? (
                                    <div className="text-zinc-500">No checklist items evaluated.</div>
                                ) : (
                                    report.checklist_results.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 shrink-0 ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                                                    {item.passed ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${item.passed ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                                        {item.text}
                                                    </p>
                                                    {item.is_critical && (
                                                        <span className="text-[10px] uppercase font-bold text-red-400 mt-1 block tracking-wider">
                                                            Critical Action
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {item.passed ? 'Completed' : 'Missed'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="pt-6 flex justify-center pb-12">
                            <GradientButton className="group" onClick={() => router.push('/languages')}>
                                Start Next Scenario
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </GradientButton>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
