"use client"

import React, { useEffect } from 'react'
import { MdClose } from 'react-icons/md'

export const SHORT_NARRATIONS: Record<string, { main: React.ReactNode, why: React.ReactNode }> = {
  fomc: {
    main: "The Federal Reserve decides interest rates and liquidity levels.",
    why: "Fed decisions can move stocks, crypto, and currencies dramatically."
  },
  interestRate: {
    main: "Interest rates represent the cost of borrowing money.",
    why: (
      <div className="space-y-1">
        <p className="font-semibold text-gray-300">When rates rise:</p>
        <p>• Loans become expensive</p>
        <p>• Liquidity decreases</p>
        <p>• Risk assets struggle</p>
      </div>
    )
  },
  cpi: {
    main: "This shows how fast prices are increasing across the economy.",
    why: "Central banks target around 2% inflation."
  },
  coreCpi: {
    main: "Core CPI removes volatile items like food and energy.",
    why: "This is the number the Federal Reserve watches closely."
  },
  pce: {
    main: "PCE measures the prices paid for goods and services.",
    why: "It is the Fed's preferred inflation gauge, guiding interest rate decisions."
  },
  ppi: {
    main: "Producer Price Index measures costs businesses pay to produce goods.",
    why: "Higher PPI often leads to future CPI increases."
  },
  ism: {
    main: "PMI measures business activity across the economy.",
    why: (
      <div className="space-y-1">
        <p>• Above 50 = growth</p>
        <p>• Below 50 = slowdown</p>
      </div>
    )
  },
  unemployment: {
    main: "The labor market is a key indicator of economic health.",
    why: "Strong employment may lead to higher interest rates."
  },
  gold: {
    main: "Gold is often used as a safe haven asset.",
    why: "When gold rises quickly, investors may be moving away from risk."
  },
  crudeOil: {
    main: "Oil prices influence transport, production, and energy costs.",
    why: "Higher oil often leads to higher inflation."
  },
  dxy: {
    main: "A stronger dollar can pull liquidity out of global markets.",
    why: "Crypto and emerging markets often struggle when the dollar rises."
  },
  btcDominance: {
    main: "BTC dominance shows Bitcoin's share of the total crypto market.",
    why: "It shows where crypto capital is flowing. Rising dominance indicates safety-seeking within crypto."
  },
  etfFlows: {
    main: "Tracks daily capital flowing into or out of US Spot Bitcoin ETFs.",
    why: "Represents large institutional capital movements. Consistent outflows signal structural selling."
  },
  fedBalanceSheet: {
    main: "The Fed balance sheet shows how much money is injected into the financial system.",
    why: "Expanding (QE) injects money into the system. Shrinking (QT) drains liquidity from risk assets."
  },
  vix: {
    main: "The VIX measures expected volatility in the S&P 500 based on options.",
    why: "Known as the 'Fear Gauge'. High VIX signals market panic, low VIX signals complacency."
  },
  bitcoin: {
    main: "Bitcoin is the largest cryptocurrency by market capitalization.",
    why: "It acts as a highly sensitive real-time proxy for global liquidity and risk appetite."
  },
  sp500: {
    main: "The S&P 500 tracks the 500 largest US publicly traded companies.",
    why: "It is the primary benchmark for US market health and drives global equity sentiment."
  },
  nasdaq: {
    main: "The NASDAQ 100 tracks the largest non-financial companies, heavily weighted toward tech.",
    why: "It is hyper-sensitive to interest rate changes because tech valuations run on cheap capital."
  },
  dowJones: {
    main: "The Dow Jones Industrial Average tracks 30 prominent, blue-chip US companies.",
    why: "Strength in the Dow often indicates healthy, broad-based economic expansion."
  },
  silver: {
    main: "Silver is both a precious metal and an essential industrial component.",
    why: "It reacts to both industrial demand growth and safe-haven investment flows."
  }
}

interface IndicatorExplainModalProps {
  indicatorKey: string
  onClose: () => void
  title: string
  detailLabel?: string
  currentValue: string
  analysis?: { label: string; msg: string; color: string } | null
}

export default function IndicatorExplainModal({ 
  indicatorKey, 
  onClose,
  title,
  detailLabel,
  currentValue,
  analysis
}: IndicatorExplainModalProps) {
  const content = SHORT_NARRATIONS[indicatorKey]

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!content) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-[360px] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{ 
          background: '#0b0e11', 
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#848e9c] mb-2">{title}</p>
          {detailLabel && (
            <p className="text-[14px] text-white font-medium">{detailLabel}</p>
          )}

          <div className="mt-3 mb-4 text-[#eab308] text-xl font-bold font-mono">
            {currentValue}
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[14px] leading-relaxed text-[#c6cdd8]">
              {content.main}
            </p>
            <div>
              <p className="font-bold text-white text-[14px] mb-1.5">
                Why this matters:
              </p>
              <div className="text-[14px] leading-relaxed text-[#848e9c]">
                {content.why}
              </div>
            </div>
            
            {analysis && (
              <div className="mt-4 pt-4 border-t border-[#2b2f36]">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-white">
                  Conditional Output
                </p>
                <p className="font-bold text-[14px] mb-1" style={{ color: analysis.color }}>
                  {analysis.label}:
                </p>
                <p className="text-[14px] leading-relaxed text-[#c6cdd8]">{analysis.msg}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
