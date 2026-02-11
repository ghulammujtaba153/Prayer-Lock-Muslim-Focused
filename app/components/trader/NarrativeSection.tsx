'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/config/url';
import { MdAutoAwesome, MdRefresh, MdMenuBook } from 'react-icons/md';
import { useAuth } from '@/context/authContext';

interface Narrative {
  content: string;
  country: string;
  marketType: string;
  sentiment: string;
  date: string;
}

export default function NarrativeSection() {
  const { user, updateProfile } = useAuth();
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNarrative = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/narrative');
      setNarrative(response.data);
    } catch (err: any) {
      console.error('Failed to fetch narrative:', err);
      setError('Wait for few seconds... generating your personalized story.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNarrative();
    }
  }, [user?.sentiment, user?.country, user?.marketType]);

  const handleSentimentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSentiment = e.target.value;
    try {
      await updateProfile({ sentiment: newSentiment });
      // The useEffect will trigger fetchNarrative when user.sentiment updates
    } catch (err) {
      console.error('Failed to update sentiment:', err);
    }
  };

  if (loading && !narrative) {
    return (
      <div className="glass-card p-12 rounded-[3rem] text-center space-y-6 animate-pulse border-white/20 dark:border-white/5">
        <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto animate-bounce flex items-center justify-center">
          <MdAutoAwesome className="text-accent text-3xl" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Crafting your story...</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Our AI is analyzing global macro trends and regional news for your perspective.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden border-white/40 dark:border-white/10 group">
        {/* Decorative Background Icon */}
        <MdMenuBook className="absolute -bottom-10 -right-10 text-[20rem] text-accent/5 -rotate-12 pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent rounded-2xl text-white">
                <MdAutoAwesome size={24} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-accent">Daily Narrative</span>
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={user?.sentiment || 'neutral'}
                onChange={handleSentimentChange}
                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer"
              >
                <option value="neutral">Neutral Sentiment</option>
                <option value="bullish">Bullish Sentiment</option>
                <option value="bearish">Bearish Sentiment</option>
              </select>

              <button 
                  onClick={fetchNarrative}
                  disabled={loading}
                  className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors text-slate-400 hover:text-accent group"
              >
                <MdRefresh size={20} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              </button>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {narrative?.content ? (
              <div className="space-y-6">
                {narrative.content.split('\n\n').map((para, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-200 leading-[1.8] text-lg md:text-xl font-medium tracking-tight whitespace-pre-wrap">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No story available for today. Select sentiment or click refresh to generate.</p>
            )}
          </div>

          {narrative && (
            <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Focus: {narrative.marketType}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Region: {narrative.country}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Sentiment: {narrative.sentiment}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Date: {narrative.date}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-400 dark:text-slate-600 italic">
          Disclaimer: This narrative is AI-generated for educational purposes and does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
