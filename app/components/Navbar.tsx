'use client';

import React, { useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for initial auth check to complete

    // Avoid redirecting if already on signin or signup pages
    const publicPages = ['/signin', '/signup'];
    if (!isAuthenticated && !publicPages.includes(pathname)) {
      router.push('/signin');
    }
  }, [isAuthenticated, router, pathname, loading]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="glass-card flex items-center justify-between px-6 py-3 rounded-2xl shadow-lg border border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">QuranicAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">User</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
              </div>
            )}
            
            {isAuthenticated && <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 transition-all border border-red-100 dark:border-red-900/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>}
          </div>
        </div>
      </div>
    </nav>
  );
}