'use client';

import { useEffect, useState } from 'react';
import { api,axiosInstance } from '../config/url';

interface Ayah {
  ayahNumber: number;
  surah: string;
  arabic: string;
  translation: string;
}

interface QuranPageData {
  page: number;
  ayahs: Ayah[];
}

interface QuranSectionProps {
  pageNumber: number;
  onNext: () => void;
}

export default function QuranSection({ pageNumber, onNext }: QuranSectionProps) {
  const [data, setData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/quran/${pageNumber}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch Quran page:', err);
        setError('Failed to load Quranic content. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [pageNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="text-slate-500 animate-pulse">Opening the Holy Book...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error || 'Failed to load Quranic verses'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm">{data.page}</span>
          {data.ayahs[0]?.surah || 'Quranic Verses'}
        </h2>
        <span className="text-sm font-medium text-slate-400 bg-slate-100 dark:bg-dark-card px-3 py-1 rounded-full uppercase tracking-widest">
          {data.ayahs[0]?.surah || 'Loading...'}
        </span>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-8 custom-scrollbar">
        {data.ayahs.map((ayah, index) => (
          <div key={index} className="space-y-4">
            <p className="text-3xl md:text-4xl font-quran text-right leading-[2] dark:text-slate-100" dir="rtl">
              {ayah.arabic}
            </p>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-accent/20 pl-4">
              {ayah.translation}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-dark-border mt-auto">
        <button
          onClick={onNext}
          className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/25 hover:bg-accent-dark hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group text-lg"
        >
          Proceed to Daily Dua
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
