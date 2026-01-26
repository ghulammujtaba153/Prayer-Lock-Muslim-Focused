'use client';

import React, { useEffect, useState } from "react";
import { axiosInstance } from '@/config/url';
import { useAuth } from "@/context/authContext";

interface Session {
  _id: string;
  page: number;
  streak: number;
  createdAt: string;
}

interface StreakHistory {
  history: Session[];
  topStreak: number;
}

const SessionHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<StreakHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const res = await axiosInstance.get(`/quran/streak-history/${user.id}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch streak history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  if (loading) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 mb-12 space-y-8 animate-fade-in px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <span className="text-4xl text-accent">🌱</span>
          Your Journey
        </h2>
        {data && (
          <div className="glass-card px-6 py-2 rounded-2xl flex items-center gap-3 border-accent/20">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Top Streak</span>
            <span className="text-2xl font-black text-accent">{data.topStreak}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.history.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-dark-border">
            <p className="text-slate-500 font-medium text-lg">Your spiritual path begins today. Complete your first session to see your progress here.</p>
          </div>
        ) : (
          data?.history.map((session) => (
            <div key={session._id} className="glass-card p-6 rounded-[2rem] border-white/20 dark:border-white/5 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  {session.streak}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Quran Session</h4>
                <p className="text-sm text-slate-500">Read Page {session.page}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                Completed
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
