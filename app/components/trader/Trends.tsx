import React, { useEffect, useState } from 'react';
import { MdTrendingUp, MdEvent, MdAccountBalance, MdTimeline, MdPublic, MdRefresh } from 'react-icons/md';
import { axiosInstance } from '@/config/url';

interface EconomicTrends {
  fedFundsRate: string;
  nextFomcMeeting: string;
  rateDecisionProbability: {
    hike: string;
    hold: string;
    cut: string;
  };
  fedBalanceSheet: string;
  inflation: {
    cpi: { yoy: string; mom: string };
    coreCpi: string;
    pce: string;
    nextRelease: string;
  };
  dxyIndex: string;
  laborMarket: {
    unemploymentRate: string;
    nonFarmPayrolls: string;
  };
  lastUpdated: string;
}

const Trends = () => {
  const [data, setData] = useState<EconomicTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/trader/trends');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load economic trends. Please check your API connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#848e9c] animate-pulse">Analyzing market trends with Gemini...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 bg-[#1e2329] rounded-2xl border border-red-500/20">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MdTrendingUp className="text-yellow-500" />
            Global Macro Trends
          </h1>
          <p className="text-[#848e9c]">Real-time economic indicators powered by AI analysis</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[#2b3139] hover:bg-[#323a45] text-white rounded-lg transition-all active:scale-95"
        >
          <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fed Policy Card */}
        <div className="bg-[#1e2329] p-6 rounded-2xl border border-[#2b2f36] hover:border-yellow-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <MdAccountBalance className="text-yellow-500 text-2xl" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Fed Policy</h3>
              <p className="text-[#848e9c] text-xs">Interest Rates & QT/QE</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">Funds Rate Target</span>
              <span className="text-white font-mono text-xl">{data.fedFundsRate}</span>
            </div>
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">Balance Sheet</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${data.fedBalanceSheet.includes('QT') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {data.fedBalanceSheet}
              </span>
            </div>
            <div className="mt-4 p-4 bg-[#0b0e11] rounded-xl">
              <p className="text-xs text-[#848e9c] mb-2 uppercase tracking-wider">Next Decision Probability</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center">
                  <div className="text-white font-bold">{data.rateDecisionProbability.hold}</div>
                  <div className="text-[10px] text-[#848e9c]">HOLD</div>
                </div>
                <div className="flex-1 text-center border-x border-[#2b2f36]">
                  <div className="text-red-400 font-bold">{data.rateDecisionProbability.hike}</div>
                  <div className="text-[10px] text-[#848e9c]">HIKE</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-green-400 font-bold">{data.rateDecisionProbability.cut}</div>
                  <div className="text-[10px] text-[#848e9c]">CUT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inflation Tracker */}
        <div className="bg-[#1e2329] p-6 rounded-2xl border border-[#2b2f36] hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <MdTimeline className="text-emerald-500 text-2xl" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Inflation</h3>
              <p className="text-[#848e9c] text-xs">CPI & PCE Data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">CPI (YoY)</span>
              <span className="text-white font-mono text-xl">{data.inflation.cpi.yoy}</span>
            </div>
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">Core CPI</span>
              <span className="text-white font-mono text-xl">{data.inflation.coreCpi}</span>
            </div>
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">PCE Inflation</span>
              <span className="text-white font-mono text-xl">{data.inflation.pce}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[#848e9c]">
              <span className="flex items-center gap-1"><MdEvent /> Next Release:</span>
              <span className="text-emerald-400 font-bold">{data.inflation.nextRelease}</span>
            </div>
          </div>
        </div>

        {/* Dollar & Labor Card */}
        <div className="bg-[#1e2329] p-6 rounded-2xl border border-[#2b2f36] hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MdPublic className="text-blue-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Market Force</h3>
              <p className="text-[#848e9c] text-xs">DXY & Labor Market</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#2b3139]/30 rounded-xl mb-4">
              <div className="text-[10px] text-[#848e9c] mb-1 uppercase tracking-wider">US Dollar Index (DXY)</div>
              <div className="text-white text-3xl font-bold font-mono">{data.dxyIndex}</div>
            </div>
            
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">Unemployment</span>
              <span className="text-white font-bold">{data.laborMarket.unemploymentRate}</span>
            </div>
            <div className="flex justify-between items-end border-b border-[#2b2f36] pb-3">
              <span className="text-[#848e9c]">Non-Farm Payrolls</span>
              <span className="text-white font-bold">{data.laborMarket.nonFarmPayrolls}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-[10px] text-[#848e9c] border-t border-[#2b2f36] pt-4">
        <span>Analysis model: Gemini 1.5 Flash</span>
        <span>Last AI scan: {new Date(data.lastUpdated).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default Trends;
