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

// ─── FOMC Card Extra ─────────────────────────────────────────────────────────

function FomcCardExtra({ data }: { data: any }) {
  const fomc = data?.fomc
  const nextMeeting = fomc?.nextMeeting ?? data?.nextFomcMeeting
  const summary = fomc?.sentiment ?? 'The Fed is holding rates steady; focus is on balance sheet stabilization.'
  const previousMeetings: string[] = fomc?.previousMeetings ?? []

  // Days until next meeting
  let daysUntil: number | null = null
  let parsedDate: Date | null = null
  if (nextMeeting && nextMeeting !== 'N/A') {
    parsedDate = new Date(nextMeeting)
    if (!isNaN(parsedDate.getTime())) {
      const now = new Date()
      daysUntil = Math.ceil((parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  // Urgency level
  const urgency =
    daysUntil === null ? 'unknown'
    : daysUntil <= 3 ? 'critical'
    : daysUntil <= 7 ? 'warning'
    : 'safe'

  const urgencyConfig = {
    critical: {
      emoji: '🔴',
      label: 'Major volatility expected soon',
      sub: 'Traders often reduce risk before this event.',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      color: '#f87171',
      dot: '#ef4444',
    },
    warning: {
      emoji: '🟡',
      label: `${daysUntil} days away`,
      sub: 'Markets may start positioning ahead of the Fed decision.',
      bg: 'rgba(234,179,8,0.08)',
      border: 'rgba(234,179,8,0.25)',
      color: '#facc15',
      dot: '#eab308',
    },
    safe: {
      emoji: '🟢',
      label: `${daysUntil} days away`,
      sub: 'Markets are currently in a waiting phase before the next decision.',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
      color: '#34d399',
      dot: '#10b981',
    },
    unknown: {
      emoji: '⚪',
      label: 'Date unavailable',
      sub: 'Check back when the next FOMC date is confirmed.',
      bg: 'rgba(100,116,139,0.08)',
      border: 'rgba(100,116,139,0.2)',
      color: '#94a3b8',
      dot: '#64748b',
    },
  }[urgency]

  return (
    <div className="space-y-3 mt-1">
      {/* Urgency Alert */}
      <div
        className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: urgencyConfig.bg, border: `1px solid ${urgencyConfig.border}` }}
      >
        <span className="text-lg leading-none mt-0.5">{urgencyConfig.emoji}</span>
        <div>
          <p className="text-xs font-bold" style={{ color: urgencyConfig.color }}>
            {urgency === 'critical' ? '⚠ ' : ''}{urgencyConfig.label}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#848e9c' }}>{urgencyConfig.sub}</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#848e9c' }}>Summary</p>
          <p className="text-xs italic leading-relaxed" style={{ color: '#c9d1d9' }}>{summary}</p>
        </div>
      )}

      {/* Previous Meetings */}
      {previousMeetings.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#848e9c' }}>Previous Meetings</p>
          <div className="flex gap-1.5 flex-wrap">
            {previousMeetings.map((d, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-mono" style={{ background: '#0b0e11', color: '#848e9c' }}>{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Interest Rate Card Extra ───────────────────────────────────────────────────

function InterestRateCardExtra({ data }: { data: any }) {
  const ir = data?.interestRate
  const currentRaw = ir?.current ?? data?.fedFundsRate ?? 'N/A'
  const previous: string[] = ir?.previous ?? []

  // Determine trend
  const currentNum = parseFloat(String(currentRaw).replace('%', ''))
  const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
  const trend: 'rising' | 'falling' | 'stable' =
    isNaN(currentNum) || isNaN(prevNum) ? 'stable'
    : currentNum > prevNum ? 'rising'
    : currentNum < prevNum ? 'falling'
    : 'stable'

  const trendConfig = {
    rising: { label: 'Rising', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Higher borrowing costs usually pressure stocks and crypto.' },
    falling: { label: 'Falling', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Lower rates increase liquidity and support risk assets.' },
    stable: { label: 'Stable', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'Markets usually remain range bound.' },
  }[trend]

  return (
    <div className="space-y-3 mt-1">
      {/* Trend Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Trend:</span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ color: trendConfig.color, background: trendConfig.bg, border: `1px solid ${trendConfig.border}` }}>
          {trendConfig.label}
        </span>
      </div>

      {/* Conditional interpretation */}
      <div className="p-3 rounded-xl" style={{ background: trendConfig.bg, border: `1px solid ${trendConfig.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: trendConfig.color }}>{trendConfig.label}:</p>
        <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{trendConfig.msg}</p>
      </div>
    </div>
  )
}

// ─── CPI Card Extra ───────────────────────────────────────────────────────────

function CpiCardExtra({ data }: { data: any }) {
  const cpi = data?.inflation?.cpi
  const currentRaw = cpi?.current ?? cpi?.yoy ?? 'N/A'
  const previous: string[] = cpi?.previous ?? []
  const nextRelease: string | undefined = data?.inflation?.nextRelease

  const currentNum = parseFloat(String(currentRaw).replace('%', ''))
  const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
  const trend: 'rising' | 'falling' | 'stable' =
    isNaN(currentNum) || isNaN(prevNum) ? 'stable'
    : currentNum > prevNum ? 'rising'
    : currentNum < prevNum ? 'falling'
    : 'stable'

  const trendConfig = {
    rising: { label: 'Rising', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Higher inflation may force the Fed to raise interest rates.' },
    falling: { label: 'Falling', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Cooling inflation reduces pressure on the Fed.' },
    stable: { label: 'Stable', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'Inflation is holding steady — Fed is in a monitoring mode.' },
  }[trend]

  return (
    <div className="space-y-3 mt-1">
      {/* Trend Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Trend:</span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ color: trendConfig.color, background: trendConfig.bg, border: `1px solid ${trendConfig.border}` }}>
          {trendConfig.label}
        </span>
        {nextRelease && (
          <span className="ml-auto text-xs" style={{ color: '#848e9c' }}>Next: <span className="text-yellow-400 font-semibold">{nextRelease}</span></span>
        )}
      </div>

      {/* Conditional interpretation */}
      <div className="p-3 rounded-xl" style={{ background: trendConfig.bg, border: `1px solid ${trendConfig.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: trendConfig.color }}>{trendConfig.label}:</p>
        <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{trendConfig.msg}</p>
      </div>
    </div>
  )
}

// ─── Core CPI Card Extra ─────────────────────────────────────────────────────

function CoreCpiCardExtra({ data }: { data: any }) {
  const coreCpiRaw = data?.inflation?.coreCpi?.current ?? 'N/A'
  const cpiRaw = data?.inflation?.cpi?.current ?? data?.inflation?.cpi?.yoy ?? 'N/A'

  const coreNum = parseFloat(String(coreCpiRaw).replace('%', ''))
  const cpiNum = parseFloat(String(cpiRaw).replace('%', ''))
  const pressure: 'strong' | 'weak' =
    isNaN(coreNum) || isNaN(cpiNum) ? 'weak'
    : coreNum > cpiNum ? 'strong'
    : 'weak'

  const pressureConfig = {
    strong: { label: 'Strong', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Inflation may still be persistent beneath the surface.' },
    weak: { label: 'Weak', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Price pressure appears to be cooling broadly.' },
  }[pressure]

  return (
    <div className="space-y-3 mt-1">
      {/* Pressure Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Pressure:</span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ color: pressureConfig.color, background: pressureConfig.bg, border: `1px solid ${pressureConfig.border}` }}>
          {pressureConfig.label}
        </span>
      </div>

      {/* Conditional interpretation */}
      <div className="p-3 rounded-xl" style={{ background: pressureConfig.bg, border: `1px solid ${pressureConfig.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: pressureConfig.color }}>{pressureConfig.label}:</p>
        <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{pressureConfig.msg}</p>
      </div>
    </div>
  )
}

// ─── PPI Card Extra ────────────────────────────────────────────────────────

function PpiCardExtra({ data }: { data: any }) {
  const ppi = data?.inflation?.ppi
  const currentRaw = ppi?.current ?? 'N/A'
  const previous: string[] = ppi?.previous ?? []

  const currentNum = parseFloat(String(currentRaw).replace('%', ''))
  const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
  const isRising = !isNaN(currentNum) && !isNaN(prevNum) && currentNum > prevNum

  const inflationConfig = isRising
    ? { label: 'Likely', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Rising PPI signals higher costs for businesses, which are often passed on to consumers — a leading indicator of future CPI increases.' }
    : { label: 'Stable', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Producer costs appear stable or cooling, reducing near-term inflation pressure on consumer prices.' }

  return (
    <div className="space-y-3 mt-1">
      {/* Future Inflation Badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Future Inflation:</span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ color: inflationConfig.color, background: inflationConfig.bg, border: `1px solid ${inflationConfig.border}` }}>
          {inflationConfig.label}
        </span>
      </div>

      {/* Conditional interpretation */}
      <div className="p-3 rounded-xl" style={{ background: inflationConfig.bg, border: `1px solid ${inflationConfig.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: inflationConfig.color }}>Future Inflation {inflationConfig.label}:</p>
        <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{inflationConfig.msg}</p>
      </div>
    </div>
  )
}

// ─── ISM PMI Card Extra ─────────────────────────────────────────────────────

function IsmPmiCardExtra({ data }: { data: any }) {
  const ism = data?.ism
  const currentRaw = ism?.current ?? 'N/A'
  const currentNum = parseFloat(String(currentRaw))

  const isExpanding = !isNaN(currentNum) && currentNum > 50
  const isContracting = !isNaN(currentNum) && currentNum < 50

  const economyConfig =
    isExpanding
      ? { label: 'Expanding', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Economic activity remains strong. Businesses are expanding production and hiring.' }
      : isContracting
      ? { label: 'Contracting', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Businesses may be reducing production. A reading below 50 signals economic slowdown.' }
      : { label: 'Neutral', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'The economy is at a neutral inflection point near the 50 threshold.' }

  // Gauge position: 0 (full left = 0) to 100 (full right = 100), midpoint at 50
  const gaugePercent = !isNaN(currentNum) ? Math.min(Math.max(((currentNum - 30) / 40) * 100, 0), 100) : 50

  return (
    <div className="space-y-3 mt-1">
      {/* Economy status badge */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#848e9c' }}>Economy:</span>
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ color: economyConfig.color, background: economyConfig.bg, border: `1px solid ${economyConfig.border}` }}>
          {economyConfig.label}
        </span>
      </div>

      {/* Gauge or Placeholder */}
      {!isNaN(currentNum) ? (
        <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid #2b2f36' }}>
          <div className="flex justify-between text-[10px] font-bold uppercase mb-2" style={{ color: '#848e9c' }}>
            <span className="text-red-400">Contracting</span>
            <span className="font-mono text-white text-xs">{currentRaw}</span>
            <span className="text-emerald-400">Expanding</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#2b3139' }}>
            {/* Gradient track */}
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444 0%, #eab308 45%, #10b981 100%)' }} />
            {/* Midpoint line */}
            <div className="absolute top-0 bottom-0 w-px" style={{ left: '50%', background: 'rgba(255,255,255,0.4)' }} />
            {/* Indicator Dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-700 ease-out"
              style={{ left: `calc(${gaugePercent}% - 6px)`, background: economyConfig.color }}
            />
          </div>
          <div className="flex justify-between text-[9px] mt-1" style={{ color: '#3c424a' }}>
            <span>30</span><span>50 pivot</span><span>70</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed #2b2f36' }}>
           <p className="text-[10px] font-bold uppercase text-yellow-500/70 mb-1">Data Pending Refresh</p>
           <p className="text-xs text-[#848e9c]">ISM Manufacturing data is currently being updated or restricted by the provider.</p>
        </div>
      )}

      {/* Conditional interpretation */}
      <div className="p-3 rounded-xl" style={{ background: economyConfig.bg, border: `1px solid ${economyConfig.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: economyConfig.color }}>{economyConfig.label}:</p>
        <p className="text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{economyConfig.msg}</p>
      </div>
    </div>
  )
}

function EmploymentCardExtra({ data }: { data: any }) {
  const ur = data?.jobsData?.unemployment
  const currentNum = parseFloat(String(ur?.current).replace('%', ''))
  const prevNum = ur?.previous?.length > 0 ? parseFloat(String(ur.previous[0]).replace('%', '')) : NaN
  const isRising = currentNum > prevNum
  const isFalling = currentNum < prevNum

  const config = isRising
    ? { label: 'Weakening', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Economy weakening' }
    : isFalling
    ? { label: 'Strong', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Economy strong' }
    : { label: 'Stable', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'Stable' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Analysis:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function GoldCardExtra({ data }: { data: any }) {
  const gold = data?.goldPrice
  const currentNum = parseFloat(String(gold?.current).replace('$', '').replace(',', ''))
  const prevNum = gold?.previous?.length > 0 ? parseFloat(String(gold.previous[0]).replace('$', '').replace(',', '')) : NaN
  const isRisingStrongly = currentNum > prevNum * 1.005 // 0.5% move as 'strong'

  const config = isRisingStrongly
    ? { label: 'High', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Risk Aversion: High' }
    : currentNum < prevNum
    ? { label: 'Low', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Risk Aversion: Low' }
    : { label: 'Normal', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'Risk Aversion: Normal' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Risk Sentiment:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function OilCardExtra({ data }: { data: any }) {
  const q = data?.quotes?.CRUDE_OIL
  const isRising = q?.change > 0

  const config = isRising
    ? { label: 'Higher', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Inflation Risk: Higher' }
    : { label: 'Lower', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Inflation Risk: Lower' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Analysis:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function DxyCardExtra({ data }: { data: any }) {
  const dxy = data?.dxyIndex
  const isRising = dxy?.indicator === 'up'

  const config = isRising
    ? { label: 'Tightening', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Global Liquidity: Tightening' }
    : { label: 'Increasing', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Global Liquidity: Increasing' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Status:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function BtcDominanceCardExtra({ data }: { data: any }) {
  const dom = data?.btcDominance
  const isRising = dom?.indicator === 'up'

  const config = isRising
    ? { label: 'Bitcoin', color: '#facc15', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', msg: 'Capital flowing to Bitcoin' }
    : { label: 'Altcoins', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Capital flowing to Altcoins' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Capital Flow:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function EtfFlowsCardExtra({ data }: { data: any }) {
  const etf = data?.etfFlows
  const currentStr = String(etf?.dailyNet?.current)
  const isPositive = currentStr.includes('+') || (!currentStr.includes('-') && parseFloat(currentStr) > 0)

  const config = isPositive
    ? { label: 'Buying', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Institutional Buying: True' }
    : { label: 'Selling', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Institutional Selling: True' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Activity:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

function FedBalanceSheetCardExtra({ data }: { data: any }) {
  const bs = data?.fedBalanceSheet
  const isExpanding = bs?.indicator === 'up'

  const config = isExpanding
    ? { label: 'Increasing', color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', msg: 'Liquidity: Increasing' }
    : { label: 'Tightening', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', msg: 'Liquidity: Tightening' }

  return (
    <div className="space-y-3 mt-1">
      <div className="p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>Status:</p>
        <p className="text-xs font-bold italic" style={{ color: config.color }}>{config.msg}</p>
      </div>
    </div>
  )
}

// ─── Card definitions ─────────────────────────────────────────────────────────

interface CardDef {
  key: string
  title: string
  detailLabel?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  getData: (data: any) => TrendValue | null
  renderExtra?: (data: any) => React.ReactNode
  getAnalysis?: (data: any) => { label: string; msg: string; color: string } | null
}

const CARDS: CardDef[] = [
  {
    key: 'fomc',
    title: 'Federal Reserve Policy Meeting',
    detailLabel: 'Next Meeting',
    icon: MdEvent,
    getData: (data) => {
      const fomc = data?.fomc
      const nextMeeting = fomc?.nextMeeting ?? data?.nextFomcMeeting ?? 'N/A'
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      if (nextMeeting !== 'N/A') {
        const d = new Date(nextMeeting)
        if (!isNaN(d.getTime())) {
          const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (days <= 3) sentiment = 'bearish'
          else if (days <= 7) sentiment = 'neutral'
          else sentiment = 'bullish'
        }
      }
      return {
        current: nextMeeting,
        previous: [],
        indicator: 'neutral',
        sentiment,
      }
    },
    renderExtra: (data) => <FomcCardExtra data={data} />,
    getAnalysis: (data) => {
      const nextMeeting = data?.fomc?.nextMeeting ?? data?.nextFomcMeeting
      if (!nextMeeting || nextMeeting === 'N/A') return null
      const d = new Date(nextMeeting)
      if (isNaN(d.getTime())) return null
      const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (days <= 3) return { label: 'Major volatility imminent', msg: 'Traders often reduce risk before this event.', color: '#f87171' }
      if (days <= 7) return { label: 'Positioning phase', msg: 'Markets may start positioning ahead of the Fed decision.', color: '#facc15' }
      return { label: 'Wait phase', msg: 'Markets are currently in a waiting phase before the next decision.', color: '#34d399' }
    }
  },
  {
    key: 'interestRate',
    title: 'US Interest Rates',
    detailLabel: 'Current Rate',
    icon: MdAccountBalance,
    getData: (data) => data?.interestRate ?? { current: data?.fedFundsRate ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <InterestRateCardExtra data={data} />,
    getAnalysis: (data) => {
      const ir = data?.interestRate
      const currentRaw = ir?.current ?? data?.fedFundsRate ?? 'N/A'
      const previous = ir?.previous ?? []
      const currentNum = parseFloat(String(currentRaw).replace('%', ''))
      const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
      if (isNaN(currentNum) || isNaN(prevNum)) return null
      if (currentNum > prevNum) return { label: 'Rising', msg: 'Higher borrowing costs usually pressure stocks and crypto.', color: '#f87171' }
      if (currentNum < prevNum) return { label: 'Falling', msg: 'Lower rates increase liquidity and support risk assets.', color: '#34d399' }
      return { label: 'Stable', msg: 'Markets usually remain range bound.', color: '#facc15' }
    }
  },
  {
    key: 'cpi',
    title: 'Consumer Price Inflation',
    detailLabel: 'Current CPI',
    icon: MdTimeline,
    getData: (data) => data?.inflation?.cpi ?? { current: data?.inflation?.cpi?.yoy ?? 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <CpiCardExtra data={data} />,
    getAnalysis: (data) => {
      const cpi = data?.inflation?.cpi
      const currentRaw = cpi?.current ?? cpi?.yoy ?? 'N/A'
      const previous = cpi?.previous ?? []
      const currentNum = parseFloat(String(currentRaw).replace('%', ''))
      const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
      if (isNaN(currentNum) || isNaN(prevNum)) return null
      if (currentNum > prevNum) return { label: 'Rising', msg: 'Higher inflation may force the Fed to raise interest rates.', color: '#f87171' }
      if (currentNum < prevNum) return { label: 'Falling', msg: 'Cooling inflation reduces pressure on the Fed.', color: '#34d399' }
      return { label: 'Stable', msg: 'Inflation is holding steady — Fed is in a monitoring mode.', color: '#facc15' }
    }
  },
  {
    key: 'coreCpi',
    title: 'Core Inflation',
    icon: MdTimeline,
    getData: (data) => data?.inflation?.coreCpi ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <CoreCpiCardExtra data={data} />,
    getAnalysis: (data) => {
      const coreCpiRaw = data?.inflation?.coreCpi?.current ?? 'N/A'
      const cpiRaw = data?.inflation?.cpi?.current ?? data?.inflation?.cpi?.yoy ?? 'N/A'
      const coreNum = parseFloat(String(coreCpiRaw).replace('%', ''))
      const cpiNum = parseFloat(String(cpiRaw).replace('%', ''))
      if (isNaN(coreNum) || isNaN(cpiNum)) return null
      if (coreNum > cpiNum) return { label: 'Strong', msg: 'Inflation may still be persistent beneath the surface.', color: '#f87171' }
      return { label: 'Weak', msg: 'Price pressure appears to be cooling broadly.', color: '#34d399' }
    }
  },
  {
    key: 'pce',
    title: 'PCE Inflation',
    detailLabel: "Fed's preferred inflation gauge",
    icon: MdTimeline,
    getData: (data) => data?.inflation?.pce ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'ppi',
    title: 'Producer Price Index',
    icon: MdTimeline,
    getData: (data) => data?.inflation?.ppi ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <PpiCardExtra data={data} />,
    getAnalysis: (data) => {
      const ppi = data?.inflation?.ppi
      const currentRaw = ppi?.current ?? 'N/A'
      const previous = ppi?.previous ?? []
      const currentNum = parseFloat(String(currentRaw).replace('%', ''))
      const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
      if (isNaN(currentNum) || isNaN(prevNum)) return null
      if (currentNum > prevNum) return { label: 'Likely', msg: 'Higher PPI often leads to future CPI increases.', color: '#f87171' }
      return { label: 'Stable', msg: 'Producer costs appear stable or cooling.', color: '#34d399' }
    }
  },
  {
    key: 'ism',
    title: 'ISM PMI',
    detailLabel: 'Manufacturing Activity Index',
    icon: MdBarChart,
    getData: (data) => {
      const ism = data?.ism
      if (!ism) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      const val = parseFloat(String(ism.current))
      const sentiment: 'bullish' | 'bearish' | 'neutral' =
        isNaN(val) ? 'neutral' : val > 50 ? 'bullish' : val < 50 ? 'bearish' : 'neutral'
      return { ...ism, sentiment }
    },
    renderExtra: (data) => <IsmPmiCardExtra data={data} />,
    getAnalysis: (data) => {
      const ism = data?.ism
      const currentNum = parseFloat(String(ism?.current))
      if (isNaN(currentNum)) return null
      if (currentNum > 50) return { label: 'Expansion', msg: 'Economic activity remains strong.', color: '#34d399' }
      if (currentNum < 50) return { label: 'Contraction', msg: 'Businesses may be reducing production.', color: '#f87171' }
      return { label: 'Neutral', msg: 'The economy is at a neutral inflection point near the 50 threshold.', color: '#facc15' }
    }
  },
  {
    key: 'unemployment',
    title: 'Employment Data',
    detailLabel: 'Labor Market Strength',
    icon: MdBarChart,
    getData: (data) => data?.jobsData?.unemployment ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <EmploymentCardExtra data={data} />,
    getAnalysis: (data) => {
      const ur = data?.jobsData?.unemployment
      const currentNum = parseFloat(String(ur?.current).replace('%', ''))
      const previous = ur?.previous ?? []
      const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('%', '')) : NaN
      if (isNaN(currentNum) || isNaN(prevNum)) return null
      if (currentNum > prevNum) return { label: 'Weakening', msg: 'Economy weakening', color: '#f87171' }
      if (currentNum < prevNum) return { label: 'Strong', msg: 'Economy strong', color: '#34d399' }
      return { label: 'Stable', msg: 'Labor market maintains steady levels.', color: '#facc15' }
    }
  },
  {
    key: 'gold',
    title: 'Gold',
    detailLabel: 'Safe Haven Asset',
    icon: FaCoins,
    getData: (data) => data?.goldPrice ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <GoldCardExtra data={data} />,
    getAnalysis: (data) => {
      const gold = data?.goldPrice
      const currentNum = parseFloat(String(gold?.current).replace('$', '').replace(',', ''))
      const previous = gold?.previous ?? []
      const prevNum = previous.length > 0 ? parseFloat(String(previous[0]).replace('$', '').replace(',', '')) : NaN
      if (isNaN(currentNum) || isNaN(prevNum)) return null
      if (currentNum > prevNum * 1.005) return { label: 'High', msg: 'Investors may be moving away from risk.', color: '#f87171' }
      if (currentNum < prevNum) return { label: 'Low', msg: 'Market fear is low, gold prices cooling.', color: '#34d399' }
      return { label: 'Normal Sentiment', msg: 'Risk aversion levels are within normal ranges.', color: '#facc15' }
    }
  },
  {
    key: 'crudeOil',
    title: 'Oil',
    detailLabel: 'Inflation Pressure Detection',
    icon: FaOilCan,
    getData: (data) => {
      const q = data?.quotes?.CRUDE_OIL
      if (!q) return { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' }
      return {
        current: `$${q.price?.toFixed(2)}`,
        previous: [],
        indicator: q.change > 0 ? 'up' : 'down',
        sentiment: q.change > 0 ? 'bearish' : 'bullish'
      }
    },
    renderExtra: (data) => <OilCardExtra data={data} />,
    getAnalysis: (data) => {
      const q = data?.quotes?.CRUDE_OIL
      if (!q) return null
      if (q.change > 0) return { label: 'Higher', msg: 'Rising oil prices lead to higher inflation.', color: '#f87171' }
      return { label: 'Lower', msg: 'Falling oil prices reduce inflation pressure.', color: '#34d399' }
    }
  },
  {
    key: 'dxy',
    title: 'Dollar Index (DXY)',
    detailLabel: 'Global Dollar Strength',
    icon: MdPublic,
    getData: (data) => data?.dxyIndex ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <DxyCardExtra data={data} />,
    getAnalysis: (data) => {
      const dxy = data?.dxyIndex
      if (!dxy) return null
      if (dxy.indicator === 'up') return { label: 'Tightening', msg: 'A stronger dollar pulls liquidity out of global risk assets.', color: '#f87171' }
      return { label: 'Increasing', msg: 'A weaker dollar supports global markets.', color: '#34d399' }
    }
  },
  {
    key: 'btcDominance',
    title: 'BTC Dominance',
    detailLabel: 'Crypto Capital Flows',
    icon: FaBitcoin,
    getData: (data) => data?.btcDominance ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <BtcDominanceCardExtra data={data} />,
    getAnalysis: (data) => {
      const dom = data?.btcDominance
      if (!dom) return null
      if (dom.indicator === 'up') return { label: 'Flowing to Bitcoin', msg: 'Capital is rotating into Bitcoin for safety or dominance.', color: '#facc15' }
      return { label: 'Flowing to Altcoins', msg: 'Altcoins are gaining market share, signaling high risk appetite.', color: '#34d399' }
    }
  },
  {
    key: 'etfFlows',
    title: 'ETF Flows',
    detailLabel: 'Institutional Investment',
    icon: MdAttachMoney,
    getData: (data) => data?.etfFlows?.dailyNet ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <EtfFlowsCardExtra data={data} />,
    getAnalysis: (data) => {
      const etf = data?.etfFlows
      const currentStr = String(etf?.dailyNet?.current)
      const isPositive = currentStr.includes('+') || (!currentStr.includes('-') && parseFloat(currentStr) > 0)
      if (isPositive) return { label: 'Institutional Buying', msg: 'Large capital inflows from institutions support price.', color: '#34d399' }
      return { label: 'Institutional Selling', msg: 'Capital outflows from large institutions may pressure prices.', color: '#f87171' }
    }
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
    },
    getAnalysis: (data) => {
      const btc = data?.quotes?.BTC
      if (!btc) return null
      return btc.change > 0 
        ? { label: 'Daily Momentum: Bullish', msg: 'Price is trending up today, signaling positive short-term sentiment.', color: '#34d399' }
        : { label: 'Daily Momentum: Bearish', msg: 'Price is trending down today, signaling cooling short-term sentiment.', color: '#f87171' }
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
    key: 'vix',
    title: 'VIX Index',
    detailLabel: 'Market Volatility — "The Fear Gauge"',
    icon: MdSecurity,
    getData: (data) => data?.riskIndicators?.vix ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
  },
  {
    key: 'fedBalanceSheet',
    title: 'Fed Balance Sheet',
    detailLabel: 'Central Bank Assets',
    icon: MdAccountBalance,
    getData: (data) => data?.fedBalanceSheet ?? { current: 'N/A', previous: [], indicator: 'neutral', sentiment: 'neutral' },
    renderExtra: (data) => <FedBalanceSheetCardExtra data={data} />,
    getAnalysis: (data) => {
      const bs = data?.fedBalanceSheet
      if (bs?.indicator === 'up') return { label: 'Expanding Liquidity', msg: 'Fed is injecting money into the system (QE), supporting risk assets.', color: '#34d399' }
      return { label: 'Tightening Liquidity', msg: 'Fed is draining money from the system (QT), pressuring risk assets.', color: '#f87171' }
    }
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
                  className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-yellow-500/20 active:scale-95"
                  style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', color: '#facc15' }}
                >
                  <MdAutoStories size={18} />
                  Narration
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
      {explainKey && (() => {
        const activeCard = CARDS.find(c => c.key === explainKey)
        const activeData = activeCard?.getData(data)
        return (
          <IndicatorExplainModal
            indicatorKey={explainKey}
            onClose={() => setExplainKey(null)}
            title={activeCard?.title ?? ''}
            detailLabel={activeCard?.detailLabel}
            currentValue={activeData?.current ?? 'N/A'}
            analysis={activeCard?.getAnalysis?.(data)}
          />
        )
      })()}
    </div>
  )
}
