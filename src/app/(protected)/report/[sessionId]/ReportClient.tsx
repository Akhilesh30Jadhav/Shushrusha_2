"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import scenariosEn from '@/data/scenarios_mcq.json';
import scenariosHi from '@/data/scenarios_mcq_hi.json';
import scenariosMr from '@/data/scenarios_mcq_mr.json';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export default function ReportClient({ session }: { session: any }) {
    const { language, t } = useLanguage();
    const scenariosData = language === 'hi' ? scenariosHi : language === 'mr' ? scenariosMr : scenariosEn;

    const scenario = scenariosData.find(s => s.scenario_id === session.scenario_id);
    if (!scenario) return notFound();

    const totalQuestions = session.answers.length;
    const correctCount = session.answers.filter((a: any) => a.is_correct).length;
    const incorrectCount = totalQuestions - correctCount;
    const criticalMisses = session.answers.filter((a: any) => a.is_critical_miss).length;

    // Basic suggested improvements based on misses
    const suggestions = [];
    if (criticalMisses > 0) {
        suggestions.push("URGENT: Prioritize Danger Signs. You missed critical danger signs in patient assessment.");
    }
    if (incorrectCount > 2) {
        suggestions.push("Review Standard Protocols. Brush up on specific treatment steps before advising patients.");
    }
    if (correctCount === totalQuestions) {
        suggestions.push("Excellent work! You demonstrated perfect protocol adherence.");
    } else {
        suggestions.push("Take a moment to read the explanations on incorrect questions below to improve your accuracy.");
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 w-full animate-in fade-in duration-500 font-sans">
            {/* Header & Back Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 font-bold hover:text-[#FF7A00] transition-colors bg-white/50 px-4 py-2 rounded-full shadow-sm border border-white/60 backdrop-blur-sm">
                    <ArrowLeft className="w-5 h-5" /> {t('report', 'back')}
                </Link>
                <Link href={`/scenario/${scenario.scenario_id}`} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <RefreshCcw className="w-4 h-4" /> {t('report', 'retry')}
                </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#FF7A00]/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none"></div>

                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs sm:text-sm mb-2 sm:mb-3">{t('report', 'perfReport')}</div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 mb-8 sm:mb-10">{scenario.title}</h1>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-10">
                    <div className="relative rounded-[1.5rem] p-1.5 border border-gray-50/50">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 w-full h-full flex flex-col items-center bg-white p-5 sm:p-6 rounded-[1.25rem] shadow-sm border border-gray-100 min-w-[160px] sm:min-w-[180px]">
                            <div className="text-6xl sm:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-pink-500 mb-2">{session.score}%</div>
                            <div className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">{t('report', 'finalScore')}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 w-full md:w-auto justify-center">
                        <div className="relative rounded-[1.5rem] p-1.5 border border-gray-50/50 flex-1 md:flex-none">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className="relative z-10 w-full h-full flex flex-col items-center bg-green-50/90 p-4 sm:p-5 rounded-[1.25rem] border border-green-100 md:min-w-[120px]">
                                <div className="text-3xl sm:text-4xl font-extrabold text-green-600 mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2"><CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> {correctCount}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wider">{t('report', 'correct')}</div>
                            </div>
                        </div>
                        <div className="relative rounded-[1.5rem] p-1.5 border border-gray-50/50 flex-1 md:flex-none">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className="relative z-10 w-full h-full flex flex-col items-center bg-orange-50/90 p-4 sm:p-5 rounded-[1.25rem] border border-orange-100 md:min-w-[120px]">
                                <div className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2"><XCircle className="w-6 h-6 sm:w-8 sm:h-8" /> {incorrectCount}</div>
                                <div className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wider">{t('report', 'incorrect')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {criticalMisses > 0 && (
                <div className="bg-red-50/80 backdrop-blur-md border border-red-200 p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-sm">
                    <div className="bg-red-100 p-3 sm:p-4 rounded-full text-red-600 shadow-inner flex-shrink-0 animate-pulse"><AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-extrabold text-red-700 mb-1 sm:mb-2">{t('report', 'criticalMisses')} ({criticalMisses})</h3>
                        <p className="text-sm sm:text-base text-red-900/80 font-medium">{t('report', 'criticalMsg')}</p>
                    </div>
                </div>
            )}

            {/* Suggested Improvements */}
            <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-5 border-b border-gray-100">
                    <h3 className="font-extrabold text-gray-800 text-xl">{t('report', 'actionable')}</h3>
                </div>
                <div className="p-8">
                    <ul className="space-y-4">
                        {suggestions.map((sug, i) => (
                            <li key={i} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-pink-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold shadow-sm">{i + 1}</div>
                                <span className="text-gray-700 font-medium leading-relaxed">{sug}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Question Review */}
            <div className="space-y-6 pt-4">
                <h3 className="font-extrabold text-2xl text-gray-900 px-4">{t('report', 'review')}</h3>

                {session.answers.map((answer: any, idx: number) => {
                    const q = scenario.questions.find((sq: any) => sq.question_id === answer.question_id);
                    if (!q) return null;

                    const selectedOpt = q.options.find((o: any) => o.option_id === answer.selected_option_id);
                    const correctOpt = q.options.find((o: any) => o.option_id === q.correct_option_id);

                    return (
                        <div key={answer.id} className="relative rounded-[2.5rem] p-2 sm:p-3 border border-gray-50/50 transition-all hover:-translate-y-1">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className={`relative z-10 w-full h-full bg-white/90 backdrop-blur-md rounded-[2rem] border p-6 sm:p-8 flex flex-col gap-6 shadow-sm transition-all hover:shadow-md ${answer.is_critical_miss ? 'border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/60'}`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-sm ${answer.is_correct ? 'bg-gradient-to-br from-green-400 to-green-600' : (answer.is_critical_miss ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-orange-400 to-orange-500')}`}>
                                            {idx + 1}
                                        </div>
                                        <h4 className="font-bold text-lg text-gray-900 mt-1 leading-snug">{q.patient_prompt}</h4>
                                    </div>
                                    {answer.is_critical_miss && <span className="bg-red-100 text-red-700 text-xs font-extrabold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-inner uppercase tracking-wider">{t('report', 'criticalMiss')}</span>}
                                </div>

                                <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 ml-0 sm:ml-14 border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{t('player', 'yourAns')}</div>
                                    <div className={`font-bold flex items-start sm:items-center gap-3 text-base sm:text-lg ${answer.is_correct ? 'text-green-600' : 'text-orange-600'}`}>
                                        {answer.is_correct ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
                                        <span className="leading-tight">{selectedOpt?.text || "Unknown"}</span>
                                    </div>

                                    {!answer.is_correct && (
                                        <div className="mt-5 pt-5 border-t border-gray-200">
                                            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{t('player', 'correctProto')}</div>
                                            <div className="font-bold text-green-600 flex items-start sm:items-center gap-3 text-base sm:text-lg">
                                                <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> <span className="leading-tight">{correctOpt?.text || "Unknown"}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-0 sm:ml-14 bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                                    <div className="text-gray-700 font-medium text-sm sm:text-base leading-relaxed flex flex-col sm:flex-row gap-3">
                                        <span className="font-extrabold text-blue-900 uppercase text-xs tracking-wider bg-blue-100/50 px-2 py-1 rounded w-fit h-fit">{t('player', 'guide')}</span>
                                        <span>{answer.is_correct ? q.explanation_correct : q.explanation_wrong}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
