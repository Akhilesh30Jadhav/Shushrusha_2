"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Clock, ListFilter } from 'lucide-react';
import scenariosData from '@/data/scenarios_mcq.json';

export default function ScenariosPage() {
    const router = useRouter();

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    const filteredScenarios = useMemo(() => {
        return scenariosData.filter(s => {
            const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.short_description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
            const matchDiff = difficultyFilter === 'All' || s.difficulty === difficultyFilter;
            return matchSearch && matchCat && matchDiff;
        });
    }, [searchQuery, categoryFilter, difficultyFilter]);

    const categories = ['All', ...Array.from(new Set(scenariosData.map(s => s.category)))];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#E55A00]">Scenario Library</h1>
                <p className="text-muted-foreground mt-1">Browse and practice clinical protocols.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/40">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search scenarios..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] shadow-sm text-sm bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <select
                        className="bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF7A00] cursor-pointer w-full sm:w-auto shadow-sm text-gray-700"
                        value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        className="bg-white border border-gray-200 text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF7A00] cursor-pointer w-full sm:w-auto shadow-sm text-gray-700"
                        value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                {(categoryFilter !== 'All' || difficultyFilter !== 'All' || searchQuery !== '') && (
                    <button
                        onClick={() => { setCategoryFilter('All'); setDifficultyFilter('All'); setSearchQuery(''); }}
                        className="text-sm text-[#E55A00] font-semibold hover:underline px-2 ml-auto"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Scenario Grid */}
            {filteredScenarios.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/40 shadow-sm">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Search className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No scenarios found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or search term to find what you're looking for.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {filteredScenarios.map((scenario) => (
                        <div key={scenario.scenario_id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                            <div className="h-40 relative w-full bg-gradient-to-br from-indigo-50 to-pink-50 overflow-hidden">
                                <Image
                                    src={scenario.thumbnail_url}
                                    alt={scenario.title}
                                    fill
                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-lg shadow-sm ${scenario.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        scenario.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {scenario.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col bg-white">
                                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md uppercase tracking-wide mb-3">
                                    {scenario.category}
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-2 flex-1 text-[15px]">
                                    {scenario.title}
                                </h3>

                                <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-400 mb-5">
                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {scenario.duration_minutes} min</div>
                                    <div className="flex items-center gap-1.5"><ListFilter className="w-3.5 h-3.5" /> {scenario.questions.length} questions</div>
                                </div>

                                <button
                                    onClick={() => router.push(`/scenario/${scenario.scenario_id}`)}
                                    className="w-full py-2.5 bg-white border-2 border-[#FF7A00] text-[#FF7A00] hover:bg-gradient-to-r hover:from-[#FF7A00] hover:to-[#E55A00] hover:text-white rounded-full font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Start Scenario
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
