"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  FaBitcoin,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaOilCan,
  FaGlobeAmericas,
  FaGem
} from "react-icons/fa"
import { GiGoldBar } from "react-icons/gi"

const ASSET_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  BTC: { icon: FaBitcoin, color: "text-orange-500", label: "Bitcoin (BTC)" },
  GOLD: { icon: GiGoldBar, color: "text-yellow-500", label: "Gold Spot (XAU)" },
  SILVER: { icon: FaGem, color: "text-zinc-300", label: "Silver Spot (XAG)" },
  CRUDE_OIL: { icon: FaOilCan, color: "text-blue-200", label: "Crude Oil (WTI)" },
  NASDAQ: { icon: FaChartLine, color: "text-blue-500", label: "NASDAQ ETF (QQQ)" },
  DOW_JONES: { icon: FaGlobeAmericas, color: "text-green-500", label: "Dow Jones ETF (DIA)" },
  SP500: { icon: FaChartLine, color: "text-purple-500", label: "S&P 500 ETF (SPY)" },
}

interface MarketQuote {
  symbol: string
  price: number
  change: number
  percentChange: number
  high: number
  low: number
  open: number
  previousClose: number
}

const FinhubSection = () => {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchQuotes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/trader/market-quotes")
      setQuotes(response.data)
      setLastUpdated(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Error fetching market quotes:", error)
      // If server not running on localhost:5000, we might need to adjust or use relative path
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const initFetch = async () => {
      await fetchQuotes();
      interval = setInterval(fetchQuotes, 3600000); // 1 hour
    };

    initFetch();
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Loading real-time market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Real-Time Market Data</h2>
          <p className="text-zinc-400 text-sm">Powered by Finnhub API (Updated every 1m)</p>
        </div>
        {lastUpdated && (
          <p className="text-zinc-500 text-xs italic">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(quotes).map(([name, quote]) => {
          return (
            <div
              key={name}
              className="bg-zinc-900/40 hover:bg-zinc-800/60 transition-all duration-300 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const Icon = ASSET_CONFIG[name].icon;
                    return <Icon className={ASSET_CONFIG[name].color} size={24} />;
                  })()}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                  (quote.change || 0) >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {(quote.change || 0) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {(quote.percentChange || 0).toFixed(2)}%
                </div>
              </div>

              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  {ASSET_CONFIG[name].label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">
                    {quote.price > 0 
                      ? `$${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "N/A"
                    }
                  </h3>
                </div>
                <p className={`text-sm mt-1 ${(quote.change || 0) >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}`}>
                  {quote.change !== null ? `${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} Today` : "No Change Data"}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 uppercase font-medium">
                <div>
                  <span className="block text-zinc-600">High</span>
                  <span className="text-zinc-300">{(quote.high && quote.high > 0) ? `$${quote.high.toLocaleString()}` : "N/A"}</span>
                </div>
                <div>
                  <span className="block text-zinc-600">Low</span>
                  <span className="text-zinc-300">{(quote.low && quote.low > 0) ? `$${quote.low.toLocaleString()}` : "N/A"}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FinhubSection