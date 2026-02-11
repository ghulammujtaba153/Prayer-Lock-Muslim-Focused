'use client';

'use client';

import { useAuth } from "@/context/authContext";
import NarrativeSection from "@/components/trader/NarrativeSection";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null; // Should be handled by layout/guard

  return (
    <main className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500 flex flex-col items-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pt-32">
      
      {/* Hero Content */}
      <div className="max-w-4xl w-full space-y-12 animate-fade-in mb-20">
        <div className="relative inline-block group">
          <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition-all duration-700"></div>
          <h1 className="relative text-7xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Trade<span className="text-accent italic">AI</span>
          </h1>
          <p className="text-accent font-bold tracking-[0.3em] text-sm uppercase ml-1">Market Intelligence</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-tight">
            Welcome back, <span className="text-accent">{user?.name}</span>.
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
            Here is your daily personalized market narrative based on your focus in <span className="text-accent">{user?.marketType}</span>.
          </p>
        </div>
      </div>

      {/* Market Narrative Section */}
      <div className="w-full max-w-4xl">
        <NarrativeSection />
      </div>

    </main>
  );
}
