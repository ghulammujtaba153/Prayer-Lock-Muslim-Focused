'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function QuranPage() {
  const params = useParams();
  const pageParam = params.page as string;
  const pageNumber = parseInt(pageParam);
  const [data, setData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/quran/${pageNumber}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch Quran page:', err);
        setError('Failed to load Quranic content. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(pageNumber)) {
      fetchPage();
    } else {
      setLoading(false);
      setError('Invalid page number');
    }
  }, [pageNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <p className="text-slate-500 animate-pulse">Loading Quranic Verses...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg px-4">
        <div className="glass-card p-8 rounded-3xl text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Oops!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'Page not found'}</p>
          <Link 
            href="/quran/1" 
            className="inline-block px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-all"
          >
            Go to Page 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-6 rounded-3xl sticky top-4 z-10 shadow-lg border border-white/20 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-bold text-xl">{data.page}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Quranic Verses</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Page {data.page} of 604</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {data.page > 1 && (
              <Link 
                href={`/quran/${data.page - 1}`}
                className="p-2 md:px-4 md:py-2 bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-dark-border transition-all flex items-center gap-2"
              >
                <span className="hidden md:inline">Previous</span>
                <svg className="w-5 h-5 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            
            <input 
              type="number" 
              min="1" 
              max="604" 
              defaultValue={data.page}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const targetPage = (e.target as HTMLInputElement).value;
                  window.location.href = `/quran/${targetPage}`;
                }
              }}
              className="w-16 px-2 py-2 text-center rounded-xl bg-slate-100 dark:bg-dark-card border-none focus:ring-2 focus:ring-accent outline-none font-bold"
            />

            {data.page < 604 && (
              <Link 
                href={`/quran/${data.page + 1}`}
                className="p-2 md:px-4 md:py-2 bg-accent text-white rounded-xl hover:bg-accent-dark transition-all flex items-center gap-2 shadow-md shadow-accent/20"
              >
                <span className="hidden md:inline">Next</span>
                <svg className="w-5 h-5 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </header>

        {/* Content Section */}
        <main className="space-y-6">
          {data.ayahs.map((ayah, index) => (
            <div 
              key={index} 
              className="glass-card p-8 md:p-10 rounded-[2.5rem] flex flex-col gap-8 animate-slide-up border border-white/20 dark:border-white/5 group hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex justify-between items-center">
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-accent/20">
                  {ayah.surah} • {ayah.ayahNumber}
                </span>
                <button className="text-slate-400 hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                <p className="text-4xl md:text-5xl font-quran text-right leading-[2.2] dark:text-slate-100 group-hover:text-accent transition-colors duration-500" dir="rtl">
                  {ayah.arabic}
                </p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {ayah.translation}
                </p>
              </div>
            </div>
          ))}
        </main>

        {/* Bottom Navigation */}
        <footer className="mt-12 flex justify-center gap-6 pb-20">
          {data.page > 1 && (
            <Link 
              href={`/quran/${data.page - 1}`}
              className="px-8 py-4 bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-card transition-all font-bold shadow-sm"
            >
              Previous Page
            </Link>
          )}
          {data.page < 604 && (
            <Link 
              href={`/quran/${data.page + 1}`}
              className="px-10 py-4 bg-accent text-white rounded-2xl hover:bg-accent-dark shadow-xl shadow-accent/30 transition-all font-bold"
            >
              Next Page
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
