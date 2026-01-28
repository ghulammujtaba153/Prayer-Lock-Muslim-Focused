'use client';

import React from "react";
import { data } from "@/lib/duas";

export default function DuasSection({ onComplete }: { onComplete: () => void }) {
  // Get day of week (0-6, where 0 is Sunday)
  // Our data is Day 1 - Day 7
  // Let's map Sunday to Day 7, Monday to Day 1, etc.
  const dayOfWeek = new Date().getDay();
  const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todayDua = data[index];

  return (
    <div className="flex flex-col gap-8 animate-fade-in py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Daily Remembrance
        </h2>
        <p className="text-accent font-semibold tracking-wide uppercase text-sm">
          {todayDua.title}
        </p>
      </div>

      <div className="space-y-10">
        <div className="glass-card p-8 rounded-[2rem] border-accent/10 shadow-inner bg-accent/[0.02]">
          <p className="text-4xl font-quran text-center leading-[2] text-accent" dir="rtl">
            {todayDua.dua.arabic}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Translation</h3>
            <p className="text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
              &quot;{todayDua.dua.translation}&quot;
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today&apos;s Reflection</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              {todayDua.dua.reflection}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 relative z-10">
        <button
          onClick={onComplete}
          className="w-full py-4 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-lg cursor-pointer"
        >
          Complete Session
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}