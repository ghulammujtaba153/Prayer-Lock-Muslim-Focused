import React, { useEffect, useState } from 'react';
import { 
  MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdEvent, 
  MdAccountBalance, MdTimeline, MdPublic, MdRefresh,
  MdBarChart, MdAttachMoney, MdSecurity, MdInfoOutline
} from 'react-icons/md';
import { FaBitcoin, FaCoins } from 'react-icons/fa';
import { axiosInstance } from '@/config/url';

interface TrendValue {
  current: string;
  previous: string[];
  indicator: 'up' | 'down' | 'neutral';
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface EconomicTrends {
  fomc: { nextMeeting: string; previousMeetings: string[]; sentiment: string };
  interestRate: TrendValue;
  inflation: { cpi: TrendValue; coreCpi: TrendValue; pce: TrendValue; nextRelease: string };
  jobsData: { unemployment: TrendValue; nonFarmPayrolls: TrendValue };
  goldPrice: TrendValue;
  dxyIndex: TrendValue;
  btcDominance: TrendValue;
  etfFlows: { dailyNet: TrendValue; totalWeekly: string };
  riskIndicators: { vix: TrendValue; fearGreed: TrendValue };
  fedBalanceSheet: TrendValue & { mode: string };
  lastUpdated: string;
}

const IndicatorCard = ({ title, data, icon: Icon, detailLabel }: { title: string, data: TrendValue, icon: any, detailLabel?: string }) => {
  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'text-green-400 bg-green-500/10';
    if (sentiment === 'bearish') return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  const getIndicatorIcon = (indicator: string) => {
    if (indicator === 'up') return <MdTrendingUp className="text-sm" />;
    if (indicator === 'down') return <MdTrendingDown className="text-sm" />;
    return <MdTrendingFlat className="text-sm" />;
  };

  return (
    <div className="bg-[#1e2329] p-5 rounded-2xl border border-[#2b2f36] hover:border-yellow-500/30 transition-all flex flex-col h-full group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2b3139] rounded-xl group-hover:bg-yellow-500/10 transition-colors">
            <Icon size={20} className="text-yellow-500" />
          </div>
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">{title}</h3>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSentimentColor(data.sentiment)}`}>
          {data.sentiment}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-2">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-2xl font-bold font-mono">{data.current}</span>
          <span className="flex items-center gap-0.5 text-[#848e9c]">
            {getIndicatorIcon(data.indicator)}
          </span>
        </div>
        {detailLabel && <p className="text-[#848e9c] text-xs mt-1">{detailLabel}</p>}
      </div>

      <div className="mt-4 pt-4 border-t border-[#2b2f36]">
        <p className="text-[10px] text-[#848e9c] mb-2 uppercase tracking-tighter font-semibold">Previous Releases</p>
        <div className="flex gap-2">
          {data?.previous?.map((val, i) => (
            <div key={i} className="flex-1 bg-[#0b0e11] py-1 px-2 rounded text-[11px] text-[#848e9c] text-center font-mono">
              {val}
            </div>
          )) || <span className="text-[10px] text-[#848e9c]">N/A</span>}
        </div>
      </div>
    </div>
  );
};

const Trends = () => {
  const [data, setData] = useState<any | null>(null);
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#2b2f36] rounded-full"></div>
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-[#848e9c] animate-pulse font-medium">Analyzing global macro signals with Gemini...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 bg-[#1e2329] rounded-2xl border border-red-500/20 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdInfoOutline className="text-red-400 text-3xl" />
        </div>
        <p className="text-red-400 mb-6 font-medium">{error}</p>
        <button 
          onClick={fetchData}
          className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Detect if we have new format or legacy format
  const isNewFormat = !!data.fomc;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <MdTrendingUp className="text-black" />
            </div>
            Fundamental Indicators
          </h1>
          <p className="text-[#848e9c] text-lg">10 Key Macro Data Points for Strategic Trading</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2b3139] hover:bg-[#323a45] text-white rounded-xl transition-all active:scale-95 border border-[#3c424a]"
        >
          <MdRefresh size={22} className={loading ? 'animate-spin' : ''} />
          <span className="font-bold">Sync Market Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 1. FOMC Dates */}
        <div className="bg-[#1e2329] p-5 rounded-2xl border border-[#2b2f36] hover:border-yellow-500/30 transition-all flex flex-col h-full group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-[#2b3139] rounded-xl">
              <MdEvent size={20} className="text-yellow-500" />
            </div>
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">FOMC Calendar</h3>
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <span className="text-[10px] text-[#848e9c] uppercase block mb-1">Next Meeting</span>
              <div className="text-white text-xl font-bold font-mono">
                {isNewFormat ? data.fomc.nextMeeting : data.nextFomcMeeting || 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
              <p className="text-[11px] text-[#848e9c] italic leading-relaxed">
                {isNewFormat ? data.fomc.sentiment : "Watch for upcoming policy decisions."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#2b2f36]">
            <p className="text-[10px] text-[#848e9c] mb-2 uppercase tracking-tighter font-semibold">Probabilities</p>
            <div className="flex gap-2">
               {isNewFormat ? (
                 data.fomc.previousMeetings?.map((date: string, i: number) => (
                   <span key={i} className="text-[10px] text-[#848e9c] bg-[#0b0e11] px-2 py-0.5 rounded">{date}</span>
                 ))
               ) : (
                 <>
                   <div className="flex-1 text-center bg-[#0b0e11] rounded py-1">
                     <div className="text-red-400 text-[10px] font-bold">{data.rateDecisionProbability?.hike}</div>
                     <div className="text-[8px] text-[#848e9c]">HIKE</div>
                   </div>
                   <div className="flex-1 text-center bg-[#0b0e11] rounded py-1">
                     <div className="text-white text-[10px] font-bold">{data.rateDecisionProbability?.hold}</div>
                     <div className="text-[8px] text-[#848e9c]">HOLD</div>
                   </div>
                   <div className="flex-1 text-center bg-[#0b0e11] rounded py-1">
                     <div className="text-green-400 text-[10px] font-bold">{data.rateDecisionProbability?.cut}</div>
                     <div className="text-[8px] text-[#848e9c]">CUT</div>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* 2. US Interest Rate */}
        <IndicatorCard 
          title="US Interest Rate" 
          data={isNewFormat ? data.interestRate : { current: data.fedFundsRate, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdAccountBalance} 
          detailLabel="Fed Funds Target Rate"
        />

        {/* 3. Inflation Cards */}
        <IndicatorCard 
          title="CPI (YoY)" 
          data={isNewFormat ? data.inflation.cpi : { current: data.inflation?.cpi?.yoy, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdTimeline} 
          detailLabel={`Next: ${data.inflation?.nextRelease}`}
        />
        <IndicatorCard 
          title="Core CPI" 
          data={isNewFormat ? data.inflation.coreCpi : { current: data.inflation?.coreCpi, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdTimeline} 
        />
        <IndicatorCard 
          title="PCE Inflation" 
          data={isNewFormat ? data.inflation.pce : { current: data.inflation?.pce, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdTimeline} 
        />

        {/* 4. Jobs Data */}
        <IndicatorCard 
          title="Unemployment" 
          data={isNewFormat ? data.jobsData.unemployment : { current: data.laborMarket?.unemploymentRate, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdBarChart} 
        />
        <IndicatorCard 
          title="NFP Payrolls" 
          data={isNewFormat ? data.jobsData.nonFarmPayrolls : { current: data.laborMarket?.nonFarmPayrolls, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdBarChart} 
        />

        {/* 5. Gold Price */}
        <IndicatorCard 
          title="Gold Price" 
          data={isNewFormat ? data.goldPrice : { current: 'Loading...', previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={FaCoins} 
          detailLabel="Spot Price / USD"
        />

        {/* 6. DXY Index */}
        <IndicatorCard 
          title="DXY Index" 
          data={isNewFormat ? data.dxyIndex : { current: data.dxyIndex, previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdPublic} 
          detailLabel="US Dollar Strength"
        />

        {/* 7. BTC Dominance */}
        <IndicatorCard 
          title="BTC Dominance" 
          data={isNewFormat ? data.btcDominance : { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={FaBitcoin} 
          detailLabel="Market Cap Share %"
        />

        {/* 8. ETF Flows */}
        <IndicatorCard 
          title="ETF Net Flows" 
          data={isNewFormat ? data.etfFlows.dailyNet : { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdAttachMoney} 
          detailLabel={isNewFormat ? `Weekly: ${data.etfFlows.totalWeekly}` : 'Weekly: N/A'}
        />

        {/* 9. Risk Indicators */}
        <IndicatorCard 
          title="VIX Index" 
          data={isNewFormat ? data.riskIndicators.vix : { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdSecurity} 
          detailLabel="Market Volatility (Fear)"
        />
        <IndicatorCard 
          title="Fear & Greed" 
          data={isNewFormat ? data.riskIndicators.fearGreed : { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }} 
          icon={MdSecurity} 
          detailLabel="Crypto Market Sentiment"
        />

        {/* 10. Fed Balance Sheet */}
        <div className="bg-[#1e2329] p-5 rounded-2xl border border-[#2b2f36] hover:border-yellow-500/30 transition-all flex flex-col h-full group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#2b3139] rounded-xl">
                <MdAccountBalance size={20} className="text-yellow-500" />
              </div>
              <h3 className="text-white font-bold text-sm tracking-wide uppercase">Fed Balance Sheet</h3>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isNewFormat ? (data.fedBalanceSheet.mode === 'QT' ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10') : 'text-gray-400 bg-gray-500/10'}`}>
              {isNewFormat ? data.fedBalanceSheet.mode : 'Status'}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-white text-2xl font-bold font-mono">
                {isNewFormat ? data.fedBalanceSheet.current : (data.fedBalanceSheet?.split(' ')[0] || 'N/A')}
              </span>
              <span className="text-[#848e9c] text-xs">Trillions</span>
            </div>
            {!isNewFormat && data.fedBalanceSheet && (
              <p className="text-[10px] text-[#848e9c] mt-2 italic">{data.fedBalanceSheet}</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2b2f36]">
            <p className="text-[10px] text-[#848e9c] mb-2 uppercase tracking-tighter font-semibold">Comparison</p>
            <div className="flex gap-2">
              {isNewFormat ? (
                data.fedBalanceSheet.previous?.map((val: string, i: number) => (
                  <div key={i} className="flex-1 bg-[#0b0e11] py-1 px-2 rounded text-[11px] text-[#848e9c] text-center font-mono">{val}</div>
                ))
              ) : (
                <div className="flex-1 bg-[#0b0e11] py-1 px-2 rounded text-[11px] text-[#848e9c] text-center">Historical data sync pending...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-[#2b2f36] flex flex-col md:flex-row justify-between items-center gap-4 text-[#848e9c] text-xs">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Model: Gemini 1.5 Flash
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Real-time Analysis Active
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <MdEvent />
          <span>Last Sync: {new Date(data.lastUpdated).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Trends;
