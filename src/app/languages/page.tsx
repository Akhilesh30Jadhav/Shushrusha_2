"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/ui/gradient-button";
import { Activity } from "lucide-react";

export default function LanguagesPage() {
    const router = useRouter();
    const [languages, setLanguages] = useState<{ code: string, name: string }[]>([]);

    useEffect(() => {
        fetch('/api/languages')
            .then(res => res.json())
            .then(data => setLanguages(data));
    }, []);

    const selectLanguage = (code: string) => {
        localStorage.setItem('sushrusha_lang', code);
        router.push('/scenarios');
    };

    return (
        <main className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />

            <div className="z-10 flex flex-col items-center w-full max-w-md">
                <Activity className="w-12 h-12 text-pink-500 mb-8" />
                <h1 className="text-3xl font-bold text-white mb-2">Select Language</h1>
                <p className="text-zinc-400 mb-10 text-center">
                    Choose the language you prefer for your patient interactions.
                </p>

                <div className="flex flex-col w-full gap-4">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => selectLanguage(lang.code)}
                            className="group relative w-full overflow-hidden rounded-2xl p-px"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-between bg-zinc-950 rounded-[15px] px-6 py-5">
                                <span className="text-xl font-medium text-white">{lang.name}</span>
                                <span className="text-zinc-500 group-hover:text-white transition-colors">→</span>
                            </div>
                        </button>
                    ))}
                    {languages.length === 0 && (
                        <div className="text-center text-zinc-500 animate-pulse">Loading languages...</div>
                    )}
                </div>
            </div>
        </main>
    );
}
