"use client"

import React, { useState } from "react"
import { MdTrendingUp, MdTrendingDown, MdInfoOutline, MdCalculate } from "react-icons/md"

const Calculator = () => {
  // --- State ---
  const [side, setSide] = useState<"long" | "short">("long")
  const [marginMode, setMarginMode] = useState<"isolated" | "cross">("isolated")
  const [leverage, setLeverage] = useState<number>(20)
  const [walletBalance, setWalletBalance] = useState<string>("")
  const [contractType, setContractType] = useState<"USDS-M" | "COIN-M">("USDS-M")
  const [entryPrice, setEntryPrice] = useState<string>("")
  const [exitPrice, setExitPrice] = useState<string>("")
  const [cost, setCost] = useState<string>("") // In USDT or Base asset
  const [mmr, setMmr] = useState<number>(0.40)
  const [maintenanceAmount, setMaintenanceAmount] = useState<string>("")

  // --- Calculations ---
  const { pnl, roe, liqPrice, quantity } = React.useMemo(() => {
    const entry = parseFloat(entryPrice)
    const exit = parseFloat(exitPrice)
    const margin = parseFloat(cost)
    const balance = parseFloat(walletBalance) || 0
    const maintAmount = parseFloat(maintenanceAmount) || 0

    if (isNaN(entry) || isNaN(margin) || entry <= 0 || margin <= 0) {
      return { pnl: null, roe: null, liqPrice: null, quantity: null }
    }

    // 1. Calculate Quantity
    const qty = (margin * leverage) / entry

    // 2. Calculate PNL
    const direction = side === "long" ? 1 : -1
    let calculatedPnl = 0
    if (contractType === "USDS-M") {
        calculatedPnl = direction * (exit - entry) * qty
    } else {
        calculatedPnl = !isNaN(exit) ? direction * (margin * leverage) * (1 - entry / exit) : 0
    }
    
    const calculatedRoe = !isNaN(exit) ? (calculatedPnl / margin) * 100 : null

    // 3. Calculate Liquidation Price
    const mmrDecimal = mmr / 100
    
    // Logic Fix: In Cross mode, Total Collateral = Wallet Balance + Initial Margin
    // Your previous code used 'balance' which was only 900. It must be 1000.
    const totalCollateral = marginMode === "isolated" ? margin : (balance + margin)

    let calculatedLiq = 0
    if (contractType === "USDS-M") {
        if (side === "long") {
            // Formula: (Entry * Qty - TotalCollateral + MaintenanceAmount) / (Qty * (1 - MMR))
            calculatedLiq = (entry * qty - totalCollateral + maintAmount) / (qty * (1 - mmrDecimal))
        } else {
            // Formula: (Entry * Qty + TotalCollateral - MaintenanceAmount) / (Qty * (1 + MMR))
            calculatedLiq = (entry * qty + totalCollateral - maintAmount) / (qty * (1 + mmrDecimal))
        }
    } else {
        // COIN-M Inverse Logic
        if (side === "long") {
            calculatedLiq = (qty * entry) / (qty + (totalCollateral - maintAmount) / (1 - mmrDecimal))
        } else {
            calculatedLiq = (qty * entry) / (qty - (totalCollateral - maintAmount) / (1 + mmrDecimal))
        }
    }

    return {
      pnl: !isNaN(exit) ? calculatedPnl : null,
      roe: calculatedRoe,
      // If the math results in 0 or negative, it is displayed as 0
      liqPrice: calculatedLiq > 0 ? calculatedLiq : 0, 
      quantity: qty
    }
  }, [side, marginMode, leverage, walletBalance, contractType, entryPrice, exitPrice, cost, mmr, maintenanceAmount])


  return (
    <div className="min-h-screen text-[#eaecef] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <MdCalculate className="text-yellow-500" />
            Binance Futures Calculator
          </h1>
          <p className="text-[#848e9c]">
            Calculate the PNL (profit and loss) and the liquidation price for your positions on Binance Futures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 bg-[#1e2329] rounded-xl p-6 shadow-2xl border border-[#2b2f36]">
            
            {/* Side Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-[#2b3139] rounded-lg">
              <button
                onClick={() => setSide("long")}
                className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                  side === "long" ? "bg-[#2ebd85] text-white shadow-lg" : "text-[#848e9c] hover:bg-[#353b44]"
                }`}
              >
                <MdTrendingUp size={20} />
                Long
              </button>
              <button
                onClick={() => setSide("short")}
                className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                  side === "short" ? "bg-[#f6465d] text-white shadow-lg" : "text-[#848e9c] hover:bg-[#353b44]"
                }`}
              >
                <MdTrendingDown size={20} />
                Short
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Margin Mode */}
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Margin Mode*</label>
                  <div className="flex gap-2 p-1 bg-[#2b3139] rounded-lg">
                    <button
                      onClick={() => setMarginMode("isolated")}
                      className={`flex-1 py-2 rounded font-medium text-sm transition-all ${
                        marginMode === "isolated" ? "bg-white text-black" : "text-[#848e9c] hover:text-white"
                      }`}
                    >
                      Isolated
                    </button>
                    <button
                      onClick={() => setMarginMode("cross")}
                      className={`flex-1 py-2 rounded font-medium text-sm transition-all ${
                        marginMode === "cross" ? "bg-white text-black" : "text-[#848e9c] hover:text-white"
                      }`}
                    >
                      Cross
                    </button>
                  </div>
                </div>

                {/* Contract Type */}
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Type of Futures Contract*</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as "USDS-M" | "COIN-M")}
                    className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors cursor-pointer"
                  >
                    <option value="USDS-M">USDS-M Futures</option>
                    <option value="COIN-M">COIN-M Futures</option>
                  </select>
                </div>
              </div>

              {/* Leverage Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-[#848e9c] font-medium">Leverage</label>
                  <span className="text-yellow-500 font-bold">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="125"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entry & Exit Prices */}
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Entry Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USDT</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Exit Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USDT</span>
                  </div>
                </div>

                {/* Cost / Margin & Wallet Balance */}
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Cost / Margin*</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USDT</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Wallet Balance</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={walletBalance}
                      onChange={(e) => setWalletBalance(e.target.value)}
                      disabled={marginMode === "isolated"}
                      placeholder={marginMode === "isolated" ? "N/A" : "0.00"}
                      className={`w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono ${
                        marginMode === "isolated" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USDT</span>
                  </div>
                  {marginMode === "isolated" && (
                    <p className="text-[10px] text-[#848e9c] mt-1">If your margin mode is isolated, you can leave it blank.</p>
                  )}
                </div>

                {/* MMR & Maintenance Amount */}
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium flex items-center gap-1">
                    MMR (%)
                    <MdInfoOutline size={14} className="cursor-help" title="Maintenance Margin Rate" />
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={mmr}
                      onChange={(e) => setMmr(parseFloat(e.target.value))}
                      className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#848e9c] mb-2 font-medium">Maintenance Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maintenanceAmount}
                      onChange={(e) => setMaintenanceAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5">
            <div className="bg-[#1e2329] rounded-xl p-8 shadow-2xl border border-[#2b2f36] h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold text-[#848e9c] mb-8 uppercase tracking-wider">Results</h2>
              
              <div className="space-y-10 w-full">
                {/* Liquidation Price */}
                <div>
                  <span className="block text-sm text-[#848e9c] mb-1 font-medium">Liquidation Price</span>
                  <span className={`text-4xl font-bold font-mono ${liqPrice !== null ? "text-orange-400" : "text-[#474d57]"}`}>
                    {liqPrice !== null ? liqPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "0.0000"}
                  </span>
                  <p className="text-xs text-[#848e9c] mt-2">The price at which your position will be liquidated.</p>
                </div>

                {/* PNL */}
                <div className="pt-8 border-t border-[#2b3139]">
                  <span className="block text-sm text-[#848e9c] mb-1 font-medium">PNL (Profit and Loss)</span>
                  <div className="flex flex-col items-center">
                    <span className={`text-5xl font-bold font-mono ${
                      pnl === null ? "text-[#474d57]" : pnl >= 0 ? "text-[#2ebd85]" : "text-[#f6465d]"
                    }`}>
                      {pnl !== null ? (pnl >= 0 ? `+${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : "0.00"}
                    </span>
                    <span className={`text-lg font-bold mt-1 ${
                      roe === null ? "text-[#474d57]" : roe >= 0 ? "text-[#2ebd85]" : "text-[#f6465d]"
                    }`}>
                      ({roe !== null ? (roe >= 0 ? `+${roe.toFixed(2)}` : roe.toFixed(2)) : "0.00"}%)
                    </span>
                  </div>
                </div>

                {/* Quantity Info */}
                <div className="p-4 bg-[#2b3139] rounded-lg inline-block">
                  <div className="flex justify-between items-center gap-8">
                    <div className="text-left">
                      <p className="text-[10px] text-[#848e9c] uppercase font-bold">Position Size</p>
                      <p className="text-white font-mono font-medium">{quantity !== null ? quantity.toFixed(4) : "0.0000"} BTC</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#848e9c] uppercase font-bold">Initial Margin</p>
                      <p className="text-white font-mono font-medium">{cost || "0.00"} USDT</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-[#848e9c] text-xs max-w-xs mx-auto">
                <p>Values are estimates based on standard Binance Futures formulas. Always refer to your official wallet for exact data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calculator
