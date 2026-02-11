"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from '@/config/url';
import { MdRefresh, MdTimeline, MdBarChart, MdPublic, MdAttachMoney, MdShowChart, MdPieChart, MdTrendingDown, MdSecurity, MdAccountBalance } from "react-icons/md";

interface MarketStats {
  fomc_dates: string;
  interest_rate_us: string;
  inflation: string;
  jobs_data: string;
  gold_price: string;
  dxy_dollar: string;
  btc_dominance: string;
  etf_flows: string;
  vix_fear_greed: string;
  fed_balance_sheet: string;
}

const PerplexitySection = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/perplexity");
      if (response.data && !response.data.message) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching Perplexity stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await axiosInstance.post("/perplexity/sync");
      setStats(response.data);
    } catch (error) {
      console.error("Error syncing Perplexity stats:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) => (
    <div className="bg-[#1e2329] p-6 rounded-2xl border border-[#2b2f36] hover:border-yellow-500/50 transition-all group flex items-center gap-6">
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 shrink-0`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[#848e9c] text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-lg font-bold leading-relaxed whitespace-pre-wrap">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const data = (stats?.response ? (typeof stats.response === 'string' ? JSON.parse(stats.response) : stats.response) : stats) as MarketStats;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Market Intelligence</h2>
          <p className="text-[#848e9c]">AI-powered real-time economic and crypto statistics</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            syncing 
              ? "bg-[#2b3139] text-[#848e9c] cursor-not-out" 
              : "bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95"
          }`}
        >
          <MdRefresh className={syncing ? "animate-spin" : ""} size={20} />
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {(!data || (data as any).message) ? (
        <div className="bg-[#1e2329] text-center py-20 rounded-3xl border border-dashed border-[#2b2f36]">
          <MdPublic className="mx-auto text-[#2b2f36] w-16 h-16 mb-4" />
          <p className="text-[#848e9c] text-lg mb-6">No data available. Start your first sync to get insights.</p>
          <button
            onClick={handleSync}
            className="px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all"
          >
            Run Initial Sync
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <StatCard title="FOMC Dates" value={data.fomc_dates} icon={MdTimeline} color="bg-blue-500" />
          <StatCard title="US Interest Rate" value={data.interest_rate_us} icon={MdAttachMoney} color="bg-green-500" />
          <StatCard title="Inflation" value={data.inflation} icon={MdTrendingDown} color="bg-red-500" />
          <StatCard title="JOBS Data" value={data.jobs_data} icon={MdBarChart} color="bg-purple-500" />
          <StatCard title="Gold Price" value={data.gold_price} icon={MdShowChart} color="bg-yellow-600" />
          <StatCard title="DXY Dollar" value={data.dxy_dollar} icon={MdAttachMoney} color="bg-indigo-500" />
          <StatCard title="BTC Dominance" value={data.btc_dominance} icon={MdPieChart} color="bg-orange-500" />
          <StatCard title="ETF Flows" value={data.etf_flows} icon={MdTimeline} color="bg-cyan-500" />
          <StatCard title="VIX & Greed Index" value={data.vix_fear_greed} icon={MdSecurity} color="bg-pink-500" />
          <StatCard title="Fed Balance Sheet" value={data.fed_balance_sheet} icon={MdAccountBalance} color="bg-emerald-500" />
        </div>
      )}
    </div>
  );
};

export default PerplexitySection;