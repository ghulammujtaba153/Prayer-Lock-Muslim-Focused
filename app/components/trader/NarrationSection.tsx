"use client"

import React, { useEffect, useState, useCallback } from 'react'
import {
  MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdEvent,
  MdAccountBalance, MdTimeline, MdPublic, MdRefresh,
  MdBarChart, MdAttachMoney, MdSecurity, MdInfoOutline,
  MdChevronLeft, MdChevronRight, MdAutoStories,
} from 'react-icons/md'
import { FaBitcoin, FaCoins, FaOilCan } from 'react-icons/fa'
import { axiosInstance } from '@/config/url'
import IndicatorExplainModal from './IndicatorExplainModal'

// ─── Types ──────────────────────────────────────────────────────────────────

interface TrendValue {
  current: string
  previous: string[]
  indicator: 'up' | 'down' | 'neutral'
  sentiment: 'bullish' | 'bearish' | 'neutral'
  details?: {
    dayLow?: number; dayHigh?: number
    yearLow?: number; yearHigh?: number
    volume?: number; previousClose?: number
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sentimentStyles = {
  bullish: { badge: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20', bar: 'bg-emerald-500' },
  bearish: { badge: 'text-red-400 bg-red-500/10 border border-red-500/20', bar: 'bg-red-500' },
  neutral: { badge: 'text-gray-400 bg-gray-500/10 border border-gray-500/20', bar: 'bg-gray-500' },
}

function IndicatorIcon({ indicator }: { indicator: string }) {
  if (indicator === 'up') return <MdTrendingUp className="text-emerald-400" size={28} />
  if (indicator === 'down') return <MdTrendingDown className="text-red-400" size={28} />
  return <MdTrendingFlat className="text-gray-400" size={28} />
}

// ─── Card definitions ─────────────────────────────────────────────────────────

interface CardDef {
  key: string
  title: string
  detailLabel?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  getData: (data: any) => TrendValue | null
  renderExtra?: (data: any) => React.ReactNode
}

const CARDS: CardDef[] = [
  {
    key: 'fomc',
    title: 'FOMC Calendar',
    icon: MdEvent,
    getData: (data) => {
      const fomc = data?.fomc
      return {
        current: fomc?.nextMeeting ?? data?.nextFomcMeeting ?? 'N/A',
        previous: fomc?.previousMeetings ?? [],
        indicator: 'neutral',
        sentiment: 'neutral',
      }
    },
    renderExtra: (data) => data?.fomc?.sentiment
      ? (
        <div className="p-3 rounded-xl mt-3" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
          <p className="text-xs italic leading-relaxed" style={{ color: '#848e9c' }}>{data.fomc.sentiment}</p>
        </div>
      ) : null,
  },
  {
    key: 'interestRate',
    title: 'US Interest Rate',
    detailLabel: 'Fed Funds Target Rate',
    icon: MdAccountBalance,
    getData: (data) => data?.interestRate ?? { current: data?.fedFundsRate ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'cpi',
    title: 'CPI (YoY)',
    icon: MdTimeline,
    getData: (data) => data?.inflation?.cpi ?? { current: data?.inflation?.cpi?.yoy ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => data?.inflation?.nextRelease
      ? <p className="text-xs mt-2" style={{ color: '#848e9c' }}>Next Release: <span className="text-yellow-400 font-semibold">{data.inflation.nextRelease}</span></p>
      : null,
  },
  {
    key: 'coreCpi',
    title: 'Core CPI',
    detailLabel: 'Excludes food & energy',
    icon: MdTimeline,
    getData: (data) => data?.inflation?.coreCpi ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'pce',
    title: 'PCE Inflation',
    detailLabel: "Fed's preferred inflation gauge",
    icon: MdTimeline,
    getData: (data) => data?.inflation?.pce ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'unemployment',
    title: 'Unemployment Rate',
    detailLabel: 'U-3 Official Rate',
    icon: MdBarChart,
    getData: (data) => data?.jobsData?.unemployment ?? { current: data?.laborMarket?.unemploymentRate ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'nfp',
    title: 'NFP Payrolls',
    detailLabel: 'Monthly jobs added',
    icon: MdBarChart,
    getData: (data) => data?.jobsData?.nonFarmPayrolls ?? { current: data?.laborMarket?.nonFarmPayrolls ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'gold',
    title: 'Gold Price',
    detailLabel: 'Spot Price / USD',
    icon: FaCoins,
    getData: (data) => data?.goldPrice ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'dxy',
    title: 'DXY Index',
    detailLabel: 'US Dollar Strength Index',
    icon: MdPublic,
    getData: (data) => data?.dxyIndex ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'bitcoin',
    title: 'Bitcoin Price',
    detailLabel: 'Spot Price / USD',
    icon: FaBitcoin,
    getData: (data) => {
      const btc = data?.quotes?.BTC
      if (!btc) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      const isUp = btc.change > 0
      return {
        current: `$${btc.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        previous: [],
        indicator: isUp ? 'up' : 'down',
        sentiment: isUp ? 'bullish' : 'bearish',
        details: {
           dayLow: btc.low, dayHigh: btc.high, previousClose: btc.previousClose
        }
      }
    },
    renderExtra: (data) => {
      const btc = data?.quotes?.BTC
      if (!btc?.percentChange) return null
      const isUp = btc.percentChange > 0
      return (
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {isUp ? '+' : ''}{btc.percentChange.toFixed(2)}% Daily Change
          </span>
        </div>
      )
    }
  },
  {
    key: 'sp500',
    title: 'S&P 500',
    detailLabel: 'US Broad Market Index (SPY)',
    icon: MdTimeline,
    getData: (data) => {
      const q = data?.quotes?.SP500
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      const isUp = q.change > 0
      return {
        current: `$${q.price?.toLocaleString()}`,
        previous: [],
        indicator: isUp ? 'up' : 'down',
        sentiment: isUp ? 'bullish' : 'bearish',
        details: { dayLow: q.low, dayHigh: q.high, previousClose: q.previousClose }
      }
    },
    renderExtra: (data) => {
      const q = data?.quotes?.SP500
      if (!q?.percentChange) return null
      return <p className={`text-xs mt-2 font-bold ${q.percentChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{q.percentChange > 0 ? '+' : ''}{q.percentChange.toFixed(2)}%</p>
    }
  },
  {
    key: 'nasdaq',
    title: 'NASDAQ 100',
    detailLabel: 'US Tech Index (QQQ)',
    icon: MdTimeline,
    getData: (data) => {
      const q = data?.quotes?.NASDAQ
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      const isUp = q.change > 0
      return {
        current: `$${q.price?.toLocaleString()}`,
        previous: [],
        indicator: isUp ? 'up' : 'down',
        sentiment: isUp ? 'bullish' : 'bearish',
        details: { dayLow: q.low, dayHigh: q.high, previousClose: q.previousClose }
      }
    },
    renderExtra: (data) => {
      const q = data?.quotes?.NASDAQ
      if (!q?.percentChange) return null
      return <p className={`text-xs mt-2 font-bold ${q.percentChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{q.percentChange > 0 ? '+' : ''}{q.percentChange.toFixed(2)}%</p>
    }
  },
  {
    key: 'dowJones',
    title: 'Dow Jones',
    detailLabel: 'US Industrial Average (DIA)',
    icon: MdTimeline,
    getData: (data) => {
      const q = data?.quotes?.DOW_JONES
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      const isUp = q.change > 0
      return {
        current: `$${q.price?.toLocaleString()}`,
        previous: [],
        indicator: isUp ? 'up' : 'down',
        sentiment: isUp ? 'bullish' : 'bearish',
        details: { dayLow: q.low, dayHigh: q.high, previousClose: q.previousClose }
      }
    },
    renderExtra: (data) => {
      const q = data?.quotes?.DOW_JONES
      if (!q?.percentChange) return null
      return <p className={`text-xs mt-2 font-bold ${q.percentChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{q.percentChange > 0 ? '+' : ''}{q.percentChange.toFixed(2)}%</p>
    }
  },
  {
    key: 'crudeOil',
    title: 'Crude Oil',
    detailLabel: 'WTI Crude (USD/Barrel)',
    icon: FaOilCan,
    getData: (data) => {
      const q = data?.quotes?.CRUDE_OIL
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      return {
        current: `$${q.price?.toFixed(2)}`,
        previous: [],
        indicator: 'neutral', // We don't have change data from commodity api currently
        sentiment: 'neutral'
      }
    }
  },
  {
    key: 'silver',
    title: 'Silver Price',
    detailLabel: 'Spot Price (USD/oz)',
    icon: FaCoins,
    getData: (data) => {
      const q = data?.quotes?.SILVER
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      return {
        current: `$${q.price?.toFixed(2)}`,
        previous: [],
        indicator: 'neutral',
        sentiment: 'neutral'
      }
    }
  },
  {
    key: 'etfFlows',
    title: 'ETF Net Flows',
    icon: MdAttachMoney,
    getData: (data) => data?.etfFlows?.dailyNet ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => data?.etfFlows?.totalWeekly
      ? <p className="text-xs mt-2" style={{ color: '#848e9c' }}>Weekly Total: <span className="text-yellow-400 font-semibold">{data.etfFlows.totalWeekly}</span></p>
      : null,
  },
  {
    key: 'vix',
    title: 'VIX Index',
    detailLabel: 'Market Volatility — "The Fear Gauge"',
    icon: MdSecurity,
    getData: (data) => data?.riskIndicators?.vix ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'fearGreed',
    title: 'Fear & Greed',
    detailLabel: 'Crypto Market Sentiment (0–100)',
    icon: MdSecurity,
    getData: (data) => data?.riskIndicators?.fearGreed ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'fedBalanceSheet',
    title: 'Fed Balance Sheet',
    icon: MdAccountBalance,
    getData: (data) => data?.fedBalanceSheet ?? { current: data?.fedBalanceSheet?.split?.(' ')[0] ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => data?.fedBalanceSheet?.mode
      ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Mode:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${data.fedBalanceSheet.mode === 'QT' ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
            {data.fedBalanceSheet.mode}
          </span>
        </div>
      ) : null,
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function NarrationSection() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [animating, setAnimating] = useState(false)
  const [explainKey, setExplainKey] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const trendsRes = await axiosInstance.get('/trader/trends')
      const quotesRes = await axiosInstance.get('/trader/market-quotes')
      setData({ ...trendsRes.data, quotes: quotesRes.data })
      setError(null)
    } catch (err: any) {
      console.error('API Fetch Error:', err.response || err)
      const msg = err?.response?.data?.message || err.message || 'Unknown error'
      setError(`Failed to load data. Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const navigate = useCallback((dir: 'left' | 'right') => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setIndex(prev => dir === 'right'
        ? (prev + 1) % CARDS.length
        : (prev - 1 + CARDS.length) % CARDS.length
      )
      setAnimating(false)
    }, 260)
  }, [animating])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (explainKey) return
      if (e.key === 'ArrowRight') navigate('right')
      if (e.key === 'ArrowLeft') navigate('left')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, explainKey])

  // ── Render states
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[420px] gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#2b2f36]" />
        <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium animate-pulse" style={{ color: '#848e9c' }}>Fetching macro signals…</p>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[360px] gap-5 p-8 rounded-2xl" style={{ background: '#1e2329', border: '1px solid rgba(239,68,68,0.2)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
        <MdInfoOutline className="text-red-400" size={28} />
      </div>
      <p className="text-sm text-center font-medium text-red-400">{error}</p>
      <button onClick={fetchData} className="px-7 py-2.5 bg-yellow-500 text-black font-bold rounded-xl text-sm hover:bg-yellow-400 active:scale-95 transition-all">
        Retry
      </button>
    </div>
  )

  const card = CARDS[index]
  const cardData = card.getData(data)
  const styles = sentimentStyles[cardData?.sentiment ?? 'neutral']

  const slideStyle: React.CSSProperties = {
    transform: animating
      ? `translateX(${direction === 'right' ? '-60px' : '60px'}) scale(0.97)`
      : 'translateX(0) scale(1)',
    opacity: animating ? 0 : 1,
    transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1), opacity 0.26s ease',
  }

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MdTrendingUp className="text-yellow-500" size={22} />
            Macro Indicators
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#848e9c' }}>Key economic signals for strategic trading</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{ background: '#2b3139', border: '1px solid #3c424a' }}
        >
          <MdRefresh size={16} />
          Sync
        </button>
      </div>

      {/* Card + Nav */}
      <div className="flex items-center gap-3">
        {/* Prev btn */}
        <button
          onClick={() => navigate('left')}
          disabled={animating}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
          style={{ background: '#2b3139', border: '1px solid #3c424a' }}
        >
          <MdChevronLeft size={22} />
        </button>

        {/* Card */}
        <div className="flex-1 overflow-hidden">
          <div style={slideStyle}>
            <div
              className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(145deg, #1e2329 0%, #181c22 100%)', border: '1px solid #2b2f36', minHeight: '280px' }}
            >
              {/* Card top row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.1)' }}>
                    <card.icon size={22} className="text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base">{card.title}</h3>
                    {card.detailLabel && (
                      <p className="text-xs mt-0.5" style={{ color: '#848e9c' }}>{card.detailLabel}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase ${styles.badge}`}>
                  {cardData?.sentiment ?? '—'}
                </span>
              </div>

              {/* Main value */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-black font-mono text-white tracking-tight">
                  {cardData?.current ?? '—'}
                </span>
                <IndicatorIcon indicator={cardData?.indicator ?? 'neutral'} />
              </div>

              {/* Extra content */}
              {card.renderExtra?.(data)}

              {/* Previous releases */}
              {(cardData?.previous?.length ?? 0) > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2b2f36' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#848e9c' }}>Previous Releases</p>
                  <div className="flex gap-2 flex-wrap">
                    {cardData!.previous.map((val, i) => (
                      <div key={i} className="px-3 py-1 rounded-lg text-xs font-mono" style={{ background: '#0b0e11', color: '#848e9c' }}>
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details panel */}
              {cardData?.details && (
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #2b2f36' }}>
                  {cardData.details.dayLow && cardData.details.dayHigh && (
                    <div className="col-span-2">
                      <div className="flex justify-between text-[10px] font-semibold uppercase mb-1.5" style={{ color: '#848e9c' }}>
                        <span>Day Range</span>
                        <span className="text-white font-mono">{cardData.details.dayLow} – {cardData.details.dayHigh}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: '#2b3139' }}>
                        <div className="h-full bg-yellow-500/50 w-[60%] ml-[20%] rounded-full" />
                      </div>
                    </div>
                  )}
                  {cardData.details.volume && (
                    <div>
                      <p className="text-[9px] font-bold uppercase" style={{ color: '#848e9c' }}>Volume</p>
                      <p className="text-xs font-mono text-white">{(cardData.details.volume / 1000).toFixed(0)}K</p>
                    </div>
                  )}
                  {cardData.details.previousClose && (
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase" style={{ color: '#848e9c' }}>Prev Close</p>
                      <p className="text-xs font-mono text-white">{cardData.details.previousClose}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Explain button */}
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2b2f36' }}>
                <button
                  onClick={() => setExplainKey(card.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308' }}
                >
                  <MdAutoStories size={17} />
                  Why does this matter for trading?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next btn */}
        <button
          onClick={() => navigate('right')}
          disabled={animating}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
          style={{ background: '#2b3139', border: '1px solid #3c424a' }}
        >
          <MdChevronRight size={22} />
        </button>
      </div>

      {/* Progress dots + counter */}
      <div className="flex flex-col items-center gap-3 mt-6">
        {/* Dot strip */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-sm">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 'right' : 'left')
                setIndex(i)
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? '24px' : '8px',
                height: '8px',
                background: i === index ? '#eab308' : '#2b3139',
              }}
            />
          ))}
        </div>
        <p className="text-xs font-semibold" style={{ color: '#848e9c' }}>
          {index + 1} <span style={{ color: '#3c424a' }}>/</span> {CARDS.length}
        </p>
        <p className="text-[10px]" style={{ color: '#3c424a' }}>Use ← → arrow keys to navigate</p>
      </div>

      {/* Last updated */}
      {data?.lastUpdated && (
        <div className="flex justify-center mt-4">
          <span className="text-[10px] flex items-center gap-1.5" style={{ color: '#3c424a' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
            Last synced: {new Date(data.lastUpdated).toLocaleString()}
          </span>
        </div>
      )}

      {/* Explain Modal */}
      {explainKey && (
        <IndicatorExplainModal
          indicatorKey={explainKey}
          onClose={() => setExplainKey(null)}
        />
      )}
    </div>
  )
}