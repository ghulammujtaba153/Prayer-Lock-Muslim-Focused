"use client"

import React, { useEffect } from 'react'
import {
  MdClose, MdLightbulb, MdTrendingUp, MdTrendingDown, MdWarning,
  MdCheckCircle, MdTimeline
} from 'react-icons/md'

interface ExplainContent {
  title: string
  subtitle: string
  why: string
  bullishSignal: string
  bearishSignal: string
  tradingTip: string
  keyFact: string
}

const EXPLANATIONS: Record<string, ExplainContent> = {
  fomc: {
    title: 'FOMC Calendar',
    subtitle: 'Federal Open Market Committee Meeting Dates',
    why: 'The FOMC is the most powerful policy body in global finance. Eight times a year, a small group of Fed officials decides the direction of US interest rates — and in doing so, they move every major asset class on Earth, from equities to crypto to gold.',
    bullishSignal: 'A rate CUT or dovish language signals cheaper borrowing costs ahead — risk assets like equities, Bitcoin and gold typically rally hard.',
    bearishSignal: 'A rate HIKE or hawkish tone signals tightening liquidity — equities fall, the dollar strengthens, and speculative assets get crushed.',
    tradingTip: 'Mark FOMC dates in your calendar. Volatility spikes in the 24hrs before and after. Consider reducing exposure going into the meeting and re-entering after the dust settles.',
    keyFact: 'In 2022, five consecutive 75bps hikes from the Fed caused the S&P 500 to fall over 25% and Bitcoin to drop 75% from its peak.',
  },
  interestRate: {
    title: 'US Interest Rate',
    subtitle: 'Federal Funds Target Rate',
    why: 'Interest rates are the price of money. When rates are high, borrowing becomes expensive, economic activity slows, and investors prefer safer assets like bonds. When rates are low, money flows freely into riskier assets — equities, crypto, commodities.',
    bullishSignal: 'Rate below 3% or on a declining trajectory = risk-on. Capital flows into growth assets, emerging markets, and crypto.',
    bearishSignal: 'Rate above 5% or rising = risk-off. Bonds become attractive, equities face multiple compression, and crypto bleeds.',
    tradingTip: 'Compare the current rate to the 2-year Treasury yield. If the yield is BELOW the Fed rate, markets expect cuts ahead — a historically bullish setup.',
    keyFact: 'The "Fed put" refers to the market\'s belief that the Fed will cut rates whenever markets fall hard enough. This psychology alone moves billions in capital.',
  },
  cpi: {
    title: 'CPI (YoY)',
    subtitle: 'Consumer Price Index — Year-over-Year Inflation',
    why: 'CPI is the primary government measure of inflation. It tells you how much more expensive a basket of everyday goods is compared to 12 months ago. The Fed\'s dual mandate is maximum employment AND price stability (targeting 2% CPI).',
    bullishSignal: 'CPI trending toward 2% = Fed can ease policy = bullish for risk assets. Each lower-than-expected CPI print has historically triggered equity and crypto rallies.',
    bearishSignal: 'CPI above 3-4% = Fed stays hawkish or hikes more = bearish for growth assets. Hot CPI prints are instant market sell-offs.',
    tradingTip: 'Trade the surprise vs expectation, not the absolute number. A CPI of 3.2% when 3.5% was expected is bullish, even though 3.2% is high in absolute terms.',
    keyFact: 'US CPI peaked at 9.1% in June 2022 — the highest in 40 years — which forced the most aggressive rate-hike cycle in modern history.',
  },
  coreCpi: {
    title: 'Core CPI',
    subtitle: 'CPI excluding Food & Energy',
    why: 'Core CPI strips out volatile food and energy prices to show the "stickier" underlying inflation trend. It\'s the number the Fed watches most closely because food and energy are supply-driven and less responsive to rate hikes.',
    bullishSignal: 'Core CPI declining steadily toward 2% signals the inflation fight is being won. Services inflation cooling is especially important.',
    bearishSignal: 'Core CPI staying elevated (above 3.5%) even as headline CPI falls signals that inflation is sticky — the Fed must stay tight longer.',
    tradingTip: 'When headline CPI falls but Core stays hot (driven by services/shelter), the Fed will NOT pivot. This is a common trap traders fall into — expecting cuts too early.',
    keyFact: 'Shelter (rent) costs make up about 36% of Core CPI. Because rent data is lagged, Core CPI often understates real-time inflation changes by 6-12 months.',
  },
  pce: {
    title: 'PCE Inflation',
    subtitle: 'Personal Consumption Expenditures Price Index',
    why: 'PCE is the Fed\'s PREFERRED inflation gauge — more comprehensive than CPI as it covers what Americans actually spend money on and adjusts for substitution effects. When Powell says "2% inflation target," he means Core PCE.',
    bullishSignal: 'Core PCE at or below 2.5% and trending down = the Fed\'s inflation mission is largely complete = rate cuts ahead = risk-on.',
    bearishSignal: 'Core PCE stubbornly above 3% = Federal Reserve is locked into a "higher for longer" stance = headwind for equities and crypto.',
    tradingTip: 'PCE is released monthly and is often slightly lower than CPI. Watch the Fed\'s quarterly dot plot to see the Fed\'s own PCE forecasts — that tells you their rate path.',
    keyFact: 'PCE tends to run about 0.3-0.5% below CPI due to methodological differences — which is why the Fed targets 2% PCE, not 2% CPI.',
  },
  ppi: {
    title: 'PPI Inflation',
    subtitle: 'Producer Price Index — Producer Input Costs',
    why: 'PPI measures the average change over time in the selling prices received by domestic producers for their output. It is a "leading indicator" of CPI because when it costs more for factories to make goods, they eventually pass those costs on to consumers.',
    bullishSignal: 'PPI falling or lower than expected. This suggests that future consumer inflation will cool, giving the Fed room to cut interest rates.',
    bearishSignal: 'PPI rising or higher than expected. This indicates that "factory gate" inflation is building up, which will inevitably show up in higher CPI later.',
    tradingTip: 'Watch the "Finished Goods" component of PPI. It has the strongest correlation with final consumer prices. If PPI spikes but CPI is still low, expect a "hot" CPI print in the next 1-2 months.',
    keyFact: 'In the 1970s, PPI spikes preceded the most painful inflationary waves in US history. It is the first warning sign of an inflationary spiral.',
  },
  ism: {
    title: 'ISM PMI',
    subtitle: 'Institute for Supply Management — Manufacturing Index',
    why: 'The PMI is based on surveys of hundreds of supply chain executives. It is a "diffusion index" where a reading above 50 indicates expansion and below 50 indicates contraction. It provides the most timely snapshot of the health of the US industrial economy.',
    bullishSignal: 'A reading above 50 and rising. This shows economic growth, strong industrial demand, and general corporate health.',
    bearishSignal: 'A reading below 50 (contraction). Sustained readings below 45 are historically associated with industrial recessions.',
    tradingTip: 'The "New Orders" sub-index is the most predictive component. If New Orders are growing while the overall PMI is flat, it suggests a rebound is coming.',
    keyFact: 'The PMI is considered a "leading" indicator, whereas the official GDP data is a "lagging" indicator. Markets often move more on a PMI surprise than on the actual GDP release.',
  },
  unemployment: {
    title: 'Unemployment Rate',
    subtitle: 'U-3 Unemployment (Official Rate)',
    why: 'Unemployment is half of the Fed\'s dual mandate. Low unemployment means workers have bargaining power for higher wages — which feeds into services inflation. The Fed walks a tightrope between keeping people employed and keeping inflation tame.',
    bullishSignal: 'Unemployment rising slightly (4-5%) with inflation falling = "soft landing" = the goldilocks scenario for risk assets.',
    bearishSignal: 'Unemployment dangerously low (<3.5%) with hot inflation = Fed must stay aggressive. OR unemployment rising sharply (>5.5%) = recession risk = market panic.',
    tradingTip: 'The "Sahm Rule" states: when the 3-month average unemployment rate rises 0.5% above its prior 12-month low, the US is in a recession. This indicator has never been wrong.',
    keyFact: 'The "natural rate" of unemployment is considered ~4-4.5% by most economists. Below this creates wage pressure; above this suggests slack in the economy.',
  },
  nfp: {
    title: 'NFP Payrolls',
    subtitle: 'Non-Farm Payrolls — Monthly Jobs Added',
    why: 'Released on the first Friday of every month, the Jobs Report (NFP) is arguably the single most market-moving regular economic release. It measures how many new jobs the US economy added (or lost), giving a real-time pulse on economic strength.',
    bullishSignal: 'Strong jobs (+200K+) with cooling wage growth = economy strong but not inflationary = ideal conditions for equities.',
    bearishSignal: 'Jobs miss (<100K) suggests economic weakness. But paradoxically, a weak jobs report can be BULLISH short-term if markets expect it speeds up Fed rate cuts.',
    tradingTip: 'Be ready for "buy the bad news" or "sell the good news" reactions. A hot NFP can paradoxically crash markets because it means the Fed stays hawkish longer.',
    keyFact: 'The US economy needs roughly 100,000-150,000 new jobs per month just to absorb new workforce entrants and keep unemployment stable.',
  },
  gold: {
    title: 'Gold Price',
    subtitle: 'Spot Gold in USD per Troy Ounce',
    why: 'Gold is the ultimate store of value and the world\'s oldest safe-haven asset. It performs best during periods of currency debasement, geopolitical uncertainty, negative real interest rates, and loss of confidence in financial systems.',
    bullishSignal: 'Rising gold with a falling DXY = dollar weakness = positive for commodity traders and crypto (correlation often holds). Also bullish during crisis.',
    bearishSignal: 'Gold falling while rates rise indicates real yields are positive — opportunity cost of holding non-yielding gold increases.',
    tradingTip: 'Watch the Gold/Bitcoin ratio. When the ratio drops, Bitcoin is outperforming gold as a store-of-value play — a common signal of crypto bull market phases.',
    keyFact: 'Central banks bought a record 1,136 tonnes of gold in 2022, the highest since 1950, as nations diversified away from US dollar reserves.',
  },
  dxy: {
    title: 'DXY Index',
    subtitle: 'US Dollar Index — Weighted Against 6 Major Currencies',
    why: 'The DXY measures the US dollar\'s strength against a basket of major currencies (EUR, JPY, GBP, CAD, SEK, CHF). As the world\'s reserve currency, dollar strength ripples through every global market — especially commodities and emerging markets.',
    bullishSignal: 'DXY falling (weak dollar) = commodities priced in USD become cheaper globally = gold, oil, Bitcoin tend to rise. Also relieves pressure on EM debt.',
    bearishSignal: 'DXY rising (strong dollar) = international investors move money back to USD = pressure on gold, emerging markets, and often crypto.',
    tradingTip: 'There is an historically strong INVERSE correlation between DXY and Bitcoin. When DXY topped in 2022, Bitcoin bottomed shortly after. Watch the DXY as a leading indicator.',
    keyFact: 'DXY is heavily weighted toward EUR (57.6%), which means European monetary policy decisions significantly move this index.',
  },
  btcDominance: {
    title: 'BTC Dominance',
    subtitle: 'Bitcoin\'s Share of Total Crypto Market Cap',
    why: 'BTC dominance measures Bitcoin\'s percentage of the total cryptocurrency market capitalization. It acts as a risk-on/risk-off indicator within crypto — revealing whether capital is flowing into Bitcoin (safety) or altcoins (speculation).',
    bullishSignal: 'Rising BTC dominance after a long decline = Bitcoin season, capital rotating into BTC from altcoins. Often occurs early in a bull cycle.',
    bearishSignal: 'Falling BTC dominance + rising total market cap = altcoin season (risk appetite high). If falling during a bear market, it means capital is leaving crypto entirely.',
    tradingTip: 'Use dominance as a rotation indicator. When BTC.D peaks and reverses down, it often signals the start of an altcoin rally. Watch for the 50% level as a key psychological support/resistance.',
    keyFact: 'At Bitcoin\'s peak in 2017, BTC dominance had fallen to just 37% while altcoins surged. In the 2022 bear market, BTC dominance rose back above 65% as altcoins collapsed.',
  },
  bitcoin: {
    title: 'Bitcoin Price',
    subtitle: 'Spot Price / USD',
    why: 'Bitcoin is the apex proxy for global liquidity. Because it has no earnings, no CEO, and no cash flow to discount, its price movement is highly sensitive to the expansion or contraction of fiat money supply and global risk appetite.',
    bullishSignal: 'A rising price often previews liquidity expansion (QE, rate cuts) before traditional assets react. When Bitcoin holds support while equities drop, it shows relative strength and institutional accumulation.',
    bearishSignal: 'A sharp, sustained drop in Bitcoin often leads broader market sell-offs as liquidity dries up globally. It is the proverbial canary in the coal mine for risk-on assets.',
    tradingTip: 'Trade Bitcoin based on macro conditions, not just technicals. It moves inversely to the DXY and in tandem with the Fed balance sheet.',
    keyFact: 'Bitcoin was the best performing asset class of the 2010s, returning over 8,900,000% from its early pricing, proving its role as an ultimate speculative store of value.',
  },
  sp500: {
    title: 'S&P 500',
    subtitle: 'US Broad Market Index',
    why: 'The S&P 500 tracks the 500 largest US publicly traded companies. It is the primary benchmark for the US stock market and the single most heavily traded directional market in the world. It drives global equity sentiment.',
    bullishSignal: 'Consistent higher highs. Breaking out above the 200-day moving average usually signals long-term institutional buying.',
    bearishSignal: 'A break below major moving averages (50-day, 200-day) with high volume suggests institutional distribution (selling).',
    tradingTip: 'Watch market breadth (the number of stocks rising vs falling). If the S&P is making new highs but fewer stocks are participating, a reversal is often imminent.',
    keyFact: 'Since 1928, the S&P 500 has averaged a return of about 10% per year historically, despite wars, depressions, and pandemics.',
  },
  nasdaq: {
    title: 'NASDAQ 100',
    subtitle: 'US Tech Index',
    why: 'The NASDAQ 100 tracks the 100 largest non-financial companies listed on the Nasdaq exchange. It is heavily weighted toward high-growth tech giants. It is hyper-sensitive to interest rate changes because tech valuations depend heavily on future discounted cash flows.',
    bullishSignal: 'Outperforming the S&P 500 indicates a strong "risk-on" appetite, with investors willing to pay premiums for growth.',
    bearishSignal: 'Underperforming the broader market, especially when Treasury yields are rising, signals a rotation out of tech and into value/defensive sectors.',
    tradingTip: 'Use the NASDAQ as your gauge for maximum risk appetite. When tech runs, risk assets run. When tech dumps, it pulls everything down.',
    keyFact: 'During the Dot-Com crash of 2000-2002, the NASDAQ fell by 78% from its peak and took 15 years to reach those highs again.',
  },
  dowJones: {
    title: 'Dow Jones',
    subtitle: 'US Industrial Average',
    why: 'The Dow Jones Industrial Average (DJIA) tracks 30 prominent, blue-chip US companies. It is a price-weighted index that tends to be less volatile than the NASDAQ and more heavily weighted toward industrials, financials, and healthcare.',
    bullishSignal: 'Strength in the Dow often indicates a healthy, broad-based economic expansion rather than just speculative tech fervor.',
    bearishSignal: 'If the Dow is hitting new lows while the NASDAQ rallies, it points to underlying economic weakness (manufacturing slowing down).',
    tradingTip: 'Compare the Dow to the NASDAQ. A rotation from NASDAQ to Dow means investors are seeking safety in established dividend-paying "value" companies.',
    keyFact: 'The Dow is price-weighted, meaning a $300 stock has 3x the impact of a $100 stock on the index, regardless of actual company size.',
  },
  crudeOil: {
    title: 'Crude Oil',
    subtitle: 'WTI Crude (USD/Barrel)',
    why: 'Oil is the lifeblood of the global industrial economy. Its price reflects global economic demand, geopolitical tensions, and supply constraints. Importantly, rising oil prices directly feed into higher consumer inflation (CPI).',
    bullishSignal: 'Rising oil prices signal strong global economic demand, but if it spikes too fast, it acts as a tax on consumers and sparks inflation fears.',
    bearishSignal: 'Crashing oil prices suggest an impending global recession and demand destruction (unless caused by a sudden massive supply increase).',
    tradingTip: 'Watch oil closely around CPI release days. The Fed often excludes oil (Core CPI), but consumers feel it at the pump, which affects retail sentiment and spending.',
    keyFact: 'In April 2020, at the peak of COVID lockdowns, WTI Crude Oil futures briefly traded at negative $37 a barrel due to a total collapse in demand and lack of storage.',
  },
  silver: {
    title: 'Silver Price',
    subtitle: 'Spot Price (USD/oz)',
    why: 'Silver plays a dual role: it is a precious metal (like gold) and an essential industrial metal (used in solar panels, electronics). It is often called "the devil\'s metal" due to its extreme volatility compared to gold.',
    bullishSignal: 'When silver outpaces gold (the Gold/Silver ratio falls), it indicates strong industrial demand and a risk-on environment.',
    bearishSignal: 'When silver sharply underperforms gold, economic output is slowing down and investors are fleeing to pure safety.',
    tradingTip: 'Trade the Gold/Silver ratio. A ratio above 80 often means silver is historically undervalued compared to gold. A ratio below 50 means silver might be overbought.',
    keyFact: 'Silver is the most electrically conductive metal on Earth, making it irreplaceable in modern electronics and the transition to green energy.',
  },
  etfFlows: {
    title: 'ETF Net Flows',
    subtitle: 'Bitcoin Spot ETF Daily & Weekly Net Flows',
    why: 'Since the approval of US Bitcoin Spot ETFs in January 2024, institutional and retail investors can now gain Bitcoin exposure through traditional brokerage accounts. Daily ETF flow data shows real-time institutional demand in clean, auditable figures.',
    bullishSignal: 'Consistent positive daily inflows (especially >$500M/day) signal strong institutional demand. Sustained weekly momentum is more reliable than daily spikes.',
    bearishSignal: 'Prolonged outflows (multiple consecutive days negative) signal institutional distribution — selling by large players. This is a major red flag for near-term price action.',
    tradingTip: 'Track BlackRock\'s IBIT specifically — it has become the dominant ETF and its flows are the best proxy for institutional Bitcoin sentiment.',
    keyFact: 'Bitcoin ETFs crossed $50B in AUM in under 12 months, making them the fastest-growing ETF category in US financial history.',
  },
  vix: {
    title: 'VIX Index',
    subtitle: 'CBOE Volatility Index — "The Fear Gauge"',
    why: 'The VIX measures expected 30-day volatility in the S&P 500 based on options pricing. It\'s Wall Street\'s real-time fear meter — rising during crashes and panic, falling during calm markets. As a "risk-off" asset, a rising VIX pushes money toward safety.',
    bullishSignal: 'VIX below 15 = complacency, market calm, risk appetite high. Good environment for growth assets, though watch for complacency-driven corrections.',
    bearishSignal: 'VIX above 30 = panic and fear. Often coincides with sharp equity and crypto sell-offs. VIX above 40 signals a systemic crisis.',
    tradingTip: 'Historically, buying Bitcoin when VIX spikes above 40 and starts falling has been one of the best risk/reward trades available. Fear = opportunity.',
    keyFact: 'The VIX hit 82.69 in March 2020 (COVID crash) and 80+ in 2008 (financial crisis). These extreme readings have historically marked generational buying opportunities.',
  },
  fearGreed: {
    title: 'Fear & Greed Index',
    subtitle: 'Crypto Market Sentiment Score (0–100)',
    why: 'The Crypto Fear & Greed Index aggregates multiple market signals (volatility, momentum, social media, dominance, Google Trends) into a single sentiment score. It quantifies the crowd\'s emotional state — and contrarian traders use it to bet against the crowd.',
    bullishSignal: 'Extreme Fear (below 25) = markets are oversold, panic is at peak = historically excellent buying opportunity. Blood in the streets.',
    bearishSignal: 'Extreme Greed (above 75) = markets are overheated, retail FOMO at peak = historically a warning to reduce risk. Euphoria precedes corrections.',
    tradingTip: 'Warren Buffett\'s principle applies perfectly here: "Be fearful when others are greedy, and greedy when others are fearful." This index makes that actionable.',
    keyFact: 'Bitcoin\'s Fear & Greed Index hit a score of 5 (Extreme Fear) in June 2022 near the $17,500 cycle bottom — and hit 90+ (Extreme Greed) near every major top.',
  },
  fedBalanceSheet: {
    title: 'Fed Balance Sheet',
    subtitle: 'Federal Reserve Total Assets (QE vs QT)',
    why: 'The Fed\'s balance sheet represents the total assets it holds — primarily US Treasury bonds and mortgage-backed securities purchased through Quantitative Easing (QE). When the balance sheet expands, it injects liquidity into the financial system. When it contracts (QT), it drains liquidity.',
    bullishSignal: 'Balance sheet growing (QE) = Fed is injecting dollars into the banking system. Historically one of the strongest correlating factors with Bitcoin and equity bull markets.',
    bearishSignal: 'Balance sheet shrinking (QT) = Fed draining liquidity. Correlates strongly with risk asset bear markets as "free money" dries up.',
    tradingTip: 'Overlay the Fed\'s balance sheet chart with Bitcoin\'s price chart. The correlation is striking — every major QE program preceded a significant Bitcoin bull run.',
    keyFact: 'The Fed\'s balance sheet grew from $900B in 2008 to $9 trillion by 2022. This extraordinary expansion is considered the primary driver of the 2020-2021 asset price bubble.',
  },
}

interface IndicatorExplainModalProps {
  indicatorKey: string
  onClose: () => void
}

export default function IndicatorExplainModal({ indicatorKey, onClose }: IndicatorExplainModalProps) {
  const content = EXPLANATIONS[indicatorKey]

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(145deg, #1a1f28 0%, #12151c 100%)', border: '1px solid rgba(234,179,8,0.2)' }}
      >
        {/* Header accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #eab308, #f59e0b, #d97706)' }} />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(234,179,8,0.15)' }}>
              <MdLightbulb size={22} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-lg leading-tight">{content.title}</h2>
              <p className="text-xs mt-0.5" style={{ color: '#848e9c' }}>{content.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Why it matters */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MdTimeline className="text-yellow-400" size={15} />
              <span className="text-yellow-400 font-bold text-xs uppercase tracking-widest">Why It Matters</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#c6cdd8' }}>{content.why}</p>
          </div>

          {/* Signals */}
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MdTrendingUp className="text-emerald-400" size={15} />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Bullish Signal</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#c6cdd8' }}>{content.bullishSignal}</p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <MdTrendingDown className="text-red-400" size={15} />
                <span className="text-red-400 font-bold text-xs uppercase tracking-widest">Bearish Signal</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#c6cdd8' }}>{content.bearishSignal}</p>
            </div>
          </div>

          {/* Trading Tip */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MdCheckCircle className="text-indigo-400" size={15} />
              <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Pro Trading Tip</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#c6cdd8' }}>{content.tradingTip}</p>
          </div>

          {/* Key Fact */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MdWarning className="text-amber-400" size={15} />
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Key Historical Fact</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#c6cdd8' }}>{content.keyFact}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
