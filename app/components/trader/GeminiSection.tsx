'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdAnalytics, MdRefresh, MdTimeline, MdInfo } from 'react-icons/md';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
});

const GeminiSection = () => {
    const [stats, setStats] = useState<Record<string, string> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/gemini/daily');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch Gemini stats:', err);
            setError('Failed to load market intelligence. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Consulting Gemini for latest market intelligence...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl border border-red-500/20">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                >
                    <MdRefresh /> Retry Fetch
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <MdAnalytics className="text-yellow-500" /> Daily Market Intelligence
                    </h2>
                    <p className="text-slate-400">AI-powered macro analysis and key financial metrics</p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                    title="Refresh Stats"
                >
                    <MdRefresh className="w-6 h-6 text-slate-400 group-hover:text-yellow-500 group-active:rotate-180 transition-all duration-500" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats && Object.entries(stats).map(([key, value], index) => (
                    <div 
                        key={key}
                        className="glass-card p-6 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all hover:scale-[1.02] group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl group-hover:bg-yellow-500/20 transition-colors">
                                <MdTimeline className="w-6 h-6 text-yellow-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                Live Data
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                            {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            {value}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <MdInfo className="text-slate-600" />
                            AI GENERATED ANALYSIS
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 glass-card rounded-3xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent">
                <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2 text-center">Analyst Note</h4>
                <p className="text-slate-300 text-center italic text-sm italic max-w-2xl mx-auto">
                    &quot;These insights are generated daily by Gemini AI to provide a high-level macro overview. Always cross-verify with primary sources before making investment decisions.&quot;
                </p>
            </div>
        </div>
    );
};

export default GeminiSection;
