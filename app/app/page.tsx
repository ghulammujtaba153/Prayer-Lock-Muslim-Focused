'use client';

import { useState } from 'react';
import QuranSection from "@/components/QuranSection";
import DuasSection from "@/components/DuasSection";
import SessionHistory from "@/components/SessionHistory";
import { useAuth } from "@/context/authContext";
import { axiosInstance } from "@/config/url";


export default function Home() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'quran' | 'dua'>('quran');
  const [historyKey, setHistoryKey] = useState(0); // For refreshing history
  const [nextPage, setNextPage] = useState<number>(1);

  const startSession = async () => {
    const userId = user?.id || user?._id;
    if (userId) {
      try {
        const res = await axiosInstance.get(`/quran/next-page/${userId}`);
        setNextPage(res.data.nextPage);
      } catch (error) {
        console.error("Failed to fetch next page:", error);
      }
    }
    setCurrentStep('quran');
    setIsModalOpen(true);
  };

  const closeSession = () => {
    setIsModalOpen(false);
  };

  const proceedToDua = () => {
    setCurrentStep('dua');
  };

  const handleSessionComplete = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      console.warn("User ID not found, closing modal anyway");
      setIsModalOpen(false);
      return;
    }

    try {
      await axiosInstance.post('/quran/session', {
        userId: userId,
        page: nextPage,
      });
      setHistoryKey(prev => prev + 1);
    } catch (error) {
      console.error("Failed to record session:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent">
      
      {/* Hero Content */}
      <div className="max-w-3xl w-full text-center space-y-12 animate-fade-in">
        <div className="relative inline-block group">
          <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition-all duration-700"></div>
          <h1 className="relative text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
            Quranic<span className="text-accent italic">AI</span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
          Begin your daily journey with the Holy Quran and meaningful supplications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={startSession}
            className="group relative px-10 py-5 bg-accent text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-accent/40 hover:bg-accent-dark hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Session
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
          
          {/* <button className="px-10 py-5 glass-card rounded-[2rem] font-bold text-xl text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-dark-surface/90 transition-all">
            Explore More
          </button> */}
        </div>

        {/* Feature Highlights */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            { title: "Daily Ayah", desc: "Start with Barakah", icon: "📖" },
            { title: "Personal Dua", desc: "Day-specific reflection", icon: "🤲" },
            { title: "Deep Focus", desc: "Design for tranquility", icon: "✨" },
          ].map((f, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl border-white/20 dark:border-white/5 hover:scale-105 transition-transform duration-500">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="font-bold text-slate-800 dark:text-white">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div> */}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            onClick={closeSession}
          ></div>
          
          <div className="relative glass-card w-full max-w-2xl max-h-[90vh] rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(22,163,74,0.1)] overflow-y-auto animate-slide-up border-white/40 dark:border-white/10">
            <button 
              onClick={closeSession}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card transition-colors text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {currentStep === 'quran' ? (
              <QuranSection pageNumber={nextPage} onNext={proceedToDua} />
            ) : (
              <DuasSection onComplete={handleSessionComplete} />
            )}
          </div>
        </div>
      )}

      <SessionHistory key={historyKey} />
    </main>
  );
}
