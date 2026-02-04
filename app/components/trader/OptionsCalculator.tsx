"use client"

import React, { useState, useMemo } from "react"
import { MdInfoOutline, MdCalculate, MdTrendingUp, MdTrendingDown, MdSettings } from "react-icons/md"

// --- American Option Pricing (Multiple Models) ---

interface BinomialResult {
    price: number;
    delta: number;
    gamma: number;
}

// Standard Cox-Ross-Rubinstein (CRR) Binomial Model
// This is the industry standard and matches most financial platforms
function solveAmericanOptionCRR(
    S: number,
    K: number,
    T: number,
    v: number,
    r: number,
    q: number,
    isCall: boolean,
    steps: number = 300
): BinomialResult {
    const dt = T / steps;
    const u = Math.exp(v * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    const disc = Math.exp(-r * dt);

    // Initialize terminal values
    const values = new Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
        const St = S * Math.pow(u, steps - i) * Math.pow(d, i);
        values[i] = isCall 
            ? Math.max(0, St - K) 
            : Math.max(0, K - St);
    }

    // Step backward
    let v2_0 = 0, v2_1 = 0, v2_2 = 0;
    let v1_0 = 0, v1_1 = 0;

    for (let j = steps - 1; j >= 0; j--) {
        for (let i = 0; i <= j; i++) {
            const St = S * Math.pow(u, j - i) * Math.pow(d, i);
            const holdValue = disc * (p * values[i] + (1 - p) * values[i + 1]);
            const exerciseValue = isCall 
                ? Math.max(0, St - K) 
                : Math.max(0, K - St);
            values[i] = Math.max(holdValue, exerciseValue);
        }
        
        if (j === 2) {
            v2_0 = values[0];
            v2_1 = values[1];
            v2_2 = values[2];
        }
        if (j === 1) {
            v1_0 = values[0];
            v1_1 = values[1];
        }
    }

    const price = values[0];
    
    // Calculate Greeks from the tree
    const s1_0 = S * u;
    const s1_1 = S * d;
    const delta = (v1_0 - v1_1) / (s1_0 - s1_1);

    const s2_0 = S * u * u;
    const s2_1 = S * u * d;
    const s2_2 = S * d * d;
    
    const h1 = s2_0 - s2_1;
    const h2 = s2_1 - s2_2;
    const g1 = (v2_0 - v2_1) / h1;
    const g2 = (v2_1 - v2_2) / h2;
    const gamma = (g1 - g2) / (0.5 * (s2_0 - s2_2));

    return { price, delta, gamma };
}

// Leisen-Reimer (Peizer-Pratt) - High precision alternative
function solveAmericanOptionLR(
    S: number,
    K: number,
    T: number,
    v: number,
    r: number,
    q: number,
    isCall: boolean,
    steps: number = 201
): BinomialResult {
    const n = (steps % 2 === 0) ? steps + 1 : steps;
    const dt = T / n;
    
    const h = (z: number, n: number) => {
        const sign = z >= 0 ? 1 : -1;
        const term = (z / (n + 1/3 + 0.1/(n+1))) ** 2 * (n + 1/6);
        return 0.5 + sign * 0.5 * Math.sqrt(1 - Math.exp(-term));
    };

    const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);

    const p1 = h(d1, n);
    const p2 = h(d2, n);
    
    const u = Math.exp((r - q) * dt) * (p1 / p2);
    const d = (Math.exp((r - q) * dt) - p2 * u) / (1 - p2);
    const p = p2;
    const disc = Math.exp(-r * dt);

    const values = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
        const St = S * Math.pow(u, n - i) * Math.pow(d, i);
        values[i] = isCall 
            ? Math.max(0, St - K) 
            : Math.max(0, K - St);
    }

    let v2_0 = 0, v2_1 = 0, v2_2 = 0;
    let v1_0 = 0, v1_1 = 0;

    for (let j = n - 1; j >= 0; j--) {
        for (let i = 0; i <= j; i++) {
            const St = S * Math.pow(u, j - i) * Math.pow(d, i);
            const holdValue = disc * (p * values[i] + (1 - p) * values[i + 1]);
            const exerciseValue = isCall 
                ? Math.max(0, St - K) 
                : Math.max(0, K - St);
            values[i] = Math.max(holdValue, exerciseValue);
        }
        
        if (j === 2) {
            v2_0 = values[0];
            v2_1 = values[1];
            v2_2 = values[2];
        }
        if (j === 1) {
            v1_0 = values[0];
            v1_1 = values[1];
        }
    }

    const price = values[0];
    
    const s1_0 = S * u;
    const s1_1 = S * d;
    const delta = (v1_0 - v1_1) / (s1_0 - s1_1);

    const s2_0 = S * u * u;
    const s2_1 = S * u * d;
    const s2_2 = S * d * d;
    
    const h1 = s2_0 - s2_1;
    const h2 = s2_1 - s2_2;
    const g1 = (v2_0 - v2_1) / h1;
    const g2 = (v2_1 - v2_2) / h2;
    const gamma = (g1 - g2) / (0.5 * (s2_0 - s2_2));

    return { price, delta, gamma };
}

// --- Probability Functions for BSM ---
function norm_cdf(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302745))));
    if (x > 0) p = 1 - p;
    return p;
}

function norm_pdf(x: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

// --- European Option Pricing (Black-Scholes-Merton) ---
function solveEuropeanOption(
    S: number, K: number, T: number, v: number, r: number, q: number, isCall: boolean
): BinomialResult {
    const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);

    let price, delta;
    if (isCall) {
        price = S * Math.exp(-q * T) * norm_cdf(d1) - K * Math.exp(-r * T) * norm_cdf(d2);
        delta = Math.exp(-q * T) * norm_cdf(d1);
    } else {
        price = K * Math.exp(-r * T) * norm_cdf(-d2) - S * Math.exp(-q * T) * norm_cdf(-d1);
        delta = Math.exp(-q * T) * (norm_cdf(d1) - 1);
    }
    const gamma = (Math.exp(-q * T) * norm_pdf(d1)) / (S * v * Math.sqrt(T));

    return { price, delta, gamma };
}

// --- Solver for Implied Volatility (Newton-Raphson with fallback to Bisection) ---
function solveIV(
    S: number, K: number, T: number, r: number, q: number, 
    marketPrice: number, isCall: boolean, model: "bsm" | "binomial-crr" | "binomial-lr",
    dayCount: number
): number {
    const T_adj = T; // Already adjusted before calling
    
    // Newton-Raphson for BSM (fast and accurate)
    if (model === "bsm") {
        let v = 0.5; // Initial guess
        for (let i = 0; i < 20; i++) {
            const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T_adj) / (v * Math.sqrt(T_adj));
            const price = isCall
                ? S * Math.exp(-q * T_adj) * norm_cdf(d1) - K * Math.exp(-r * T_adj) * norm_cdf(d1 - v * Math.sqrt(T_adj))
                : K * Math.exp(-r * T_adj) * norm_cdf(-(d1 - v * Math.sqrt(T_adj))) - S * Math.exp(-q * T_adj) * norm_cdf(-d1);
            
            const vega = S * Math.exp(-q * T_adj) * norm_pdf(d1) * Math.sqrt(T_adj);
            
            if (Math.abs(vega) < 1e-10) break;
            
            const diff = price - marketPrice;
            if (Math.abs(diff) < 1e-6) break;
            
            v = v - diff / vega;
            if (v <= 0) v = 0.001;
        }
        return Math.max(0.0001, v * 100);
    }
    
    // Bisection for binomial models
    let low = 0.0001;
    let high = 5.0;
    let iv = 0.5;
    const steps = 100;
    
    for (let i = 0; i < 30; i++) {
        const mid = (low + high) / 2;
        let price;
        
        if (model === "binomial-crr") {
            price = solveAmericanOptionCRR(S, K, T_adj, mid, r, q, isCall, steps).price;
        } else {
            price = solveAmericanOptionLR(S, K, T_adj, mid, r, q, isCall, steps).price;
        }
        
        if (Math.abs(price - marketPrice) < 0.0001) break;
            
        if (price < marketPrice) {
            low = mid;
        } else {
            high = mid;
        }
        iv = mid;
    }
    return iv * 100;
}

const OptionsCalculator = () => {
    // --- State ---
    const [pricingModel, setPricingModel] = useState<"bsm" | "binomial-crr" | "binomial-lr">("binomial-crr")
    const [dayCountConvention, setDayCountConvention] = useState<252 | 365>(365)
    const [underlyingPrice, setUnderlyingPrice] = useState<string>("269.48")
    const [strikePrice, setStrikePrice] = useState<string>("270")
    const [daysToExpiration, setDaysToExpiration] = useState<string>("17")
    const [volatility, setVolatility] = useState<string>("23.52")
    const [riskFreeRate, setRiskFreeRate] = useState<string>("3.49")
    const [dividendYield, setDividendYield] = useState<string>("0.40")

    // --- IV Calculation State ---
    const [marketPriceInput, setMarketPriceInput] = useState<string>("7.40")
    const [priceType, setPriceType] = useState<"last" | "bid" | "ask">("ask")
    const [ivOptionType, setIvOptionType] = useState<"call" | "put">("call")

    // --- Calculations ---
    const results = useMemo(() => {
        const S = parseFloat(underlyingPrice);
        const K = parseFloat(strikePrice);
        const T = parseFloat(daysToExpiration) / dayCountConvention;
        const v = parseFloat(volatility) / 100;
        const r = parseFloat(riskFreeRate) / 100;
        const q = parseFloat(dividendYield) / 100;

        if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(v) || isNaN(r) || isNaN(q) || S <= 0 || K <= 0 || T <= 0 || v <= 0) {
            return null;
        }

        const steps = 300; // Higher steps for better accuracy

        let callData: BinomialResult, putData: BinomialResult;
        
        if (pricingModel === "bsm") {
            callData = solveEuropeanOption(S, K, T, v, r, q, true);
            putData = solveEuropeanOption(S, K, T, v, r, q, false);
        } else if (pricingModel === "binomial-crr") {
            callData = solveAmericanOptionCRR(S, K, T, v, r, q, true, steps);
            putData = solveAmericanOptionCRR(S, K, T, v, r, q, false, steps);
        } else {
            callData = solveAmericanOptionLR(S, K, T, v, r, q, true, steps);
            putData = solveAmericanOptionLR(S, K, T, v, r, q, false, steps);
        }

        const dT = 1 / dayCountConvention;
        const getPrice = (v_adj: number, r_adj: number, T_adj: number, isCall: boolean) => {
            if (pricingModel === "bsm") {
                return solveEuropeanOption(S, K, T_adj, v_adj, r_adj, q, isCall).price;
            } else if (pricingModel === "binomial-crr") {
                return solveAmericanOptionCRR(S, K, T_adj, v_adj, r_adj, q, isCall, steps).price;
            } else {
                return solveAmericanOptionLR(S, K, T_adj, v_adj, r_adj, q, isCall, steps).price;
            }
        };

        // Numerical Greeks
        const vegaCall = (getPrice(v + 0.01, r, T, true) - callData.price);
        const vegaPut = (getPrice(v + 0.01, r, T, false) - putData.price);
        const T_minus = Math.max(0, T - dT);
        const thetaCall = T > 0 ? (getPrice(v, r, T_minus, true) - callData.price) : 0;
        const thetaPut = T > 0 ? (getPrice(v, r, T_minus, false) - putData.price) : 0;
        const rhoCall = (getPrice(v, r + 0.01, T, true) - callData.price);
        const rhoPut = (getPrice(v, r + 0.01, T, false) - putData.price);

        // Implied Volatility calculation
        const mktP = parseFloat(marketPriceInput);
        const calculatedIV = !isNaN(mktP) && mktP > 0 
            ? solveIV(S, K, parseFloat(daysToExpiration) / dayCountConvention, r, q, mktP, ivOptionType === "call", pricingModel, dayCountConvention)
            : null;

        return {
            call: { price: callData.price, delta: callData.delta, theta: thetaCall, rho: rhoCall, vega: vegaCall },
            put: { price: putData.price, delta: putData.delta, theta: thetaPut, rho: rhoPut, vega: vegaPut },
            gammaCall: callData.gamma,
            gammaPut: putData.gamma,
            calculatedIV
        };
    }, [pricingModel, dayCountConvention, underlyingPrice, strikePrice, daysToExpiration, volatility, riskFreeRate, dividendYield, marketPriceInput, ivOptionType]);

    return (
        <div className="bg-[#1e2329] rounded-xl p-6 shadow-2xl border border-[#2b2f36] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <MdCalculate className="text-yellow-500" />
                        Options Pricing Calculator
                    </h2>
                    <p className="text-sm text-[#848e9c]">
                        Calculate theoretical option prices and Greeks with industry-standard models.
                    </p>
                </div>
                
                {/* Model & Settings */}
                <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="relative">
                        <label className="block text-[10px] text-[#848e9c] uppercase font-bold mb-1.5 ml-1">Pricing Model</label>
                        <select 
                            value={pricingModel}
                            onChange={(e) => setPricingModel(e.target.value as "bsm" | "binomial-crr" | "binomial-lr")}
                            className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-all font-medium appearance-none cursor-pointer"
                        >
                            <option value="bsm">Black-Scholes (European)</option>
                            <option value="binomial-crr">CRR Binomial (American) ⭐</option>
                            <option value="binomial-lr">Leisen-Reimer (American)</option>
                        </select>
                        <div className="absolute right-3 top-[34px] pointer-events-none text-[#848e9c]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <label className="block text-[10px] text-[#848e9c] uppercase font-bold mb-1.5 ml-1">Day Count Convention</label>
                        <select 
                            value={dayCountConvention}
                            onChange={(e) => setDayCountConvention(parseInt(e.target.value) as 252 | 365)}
                            className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-all font-medium appearance-none cursor-pointer"
                        >
                            <option value="252">252 Trading Days ⭐</option>
                            <option value="365">365 Calendar Days</option>
                        </select>
                        <div className="absolute right-3 top-[34px] pointer-events-none text-[#848e9c]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">Underlying Price (S)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={underlyingPrice}
                                    onChange={(e) => setUnderlyingPrice(e.target.value)}
                                    className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USD</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">Strike Price (K)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={strikePrice}
                                    onChange={(e) => setStrikePrice(e.target.value)}
                                    className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#848e9c]">USD</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">DTE (days)</label>
                            <input
                                type="number"
                                value={daysToExpiration}
                                onChange={(e) => setDaysToExpiration(e.target.value)}
                                className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">Volatility (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={volatility}
                                onChange={(e) => setVolatility(e.target.value)}
                                className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">Risk-free rate%</label>
                            <input
                                type="number"
                                step="0.01"
                                value={riskFreeRate}
                                onChange={(e) => setRiskFreeRate(e.target.value)}
                                className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#848e9c] mb-2 font-medium">Dividend Yield%</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dividendYield}
                                onChange={(e) => setDividendYield(e.target.value)}
                                className="w-full bg-[#2b3139] border border-[#474d57] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Volatility Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-[#848e9c] font-medium">Volatility (σ)</label>
                            <span className="text-yellow-500 font-bold font-mono">{volatility}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="300"
                            step="0.01"
                            value={volatility}
                            onChange={(e) => setVolatility(e.target.value)}
                            className="w-full h-1.5 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>
                </div>

                {/* Results Container */}
                <div className="lg:col-span-7 space-y-6">
                    {!results ? (
                        <div className="h-full flex flex-col items-center justify-center bg-[#2b3139]/30 rounded-xl border border-dashed border-[#474d57] p-8 text-center">
                            <MdInfoOutline size={48} className="text-[#474d57] mb-4" />
                            <p className="text-[#848e9c]">Please enter valid parameters to calculate option prices.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Call Card */}
                                <div className="bg-[#2b3139] rounded-xl p-5 border-l-4 border-l-[#2ebd85]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#2ebd85] font-bold flex items-center gap-1">
                                            <MdTrendingUp size={18} />
                                            CALL
                                        </h3>
                                        <span className="text-xs text-[#848e9c] font-mono">Theoretical</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="block text-xs text-[#848e9c] uppercase font-bold tracking-wider mb-1">Price</span>
                                        <span className="text-3xl font-bold font-mono text-white">
                                            ${results.call.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <GreekItem label="Delta" value={results.call.delta.toFixed(5)} />
                                        <GreekItem label="Gamma" value={results.gammaCall.toFixed(5)} />
                                        <GreekItem label="Theta" value={results.call.theta.toFixed(5)} />
                                        <GreekItem label="Vega" value={results.call.vega.toFixed(5)} />
                                        <GreekItem label="Rho" value={results.call.rho.toFixed(5)} />
                                    </div>
                                </div>

                                {/* Put Card */}
                                <div className="bg-[#2b3139] rounded-xl p-5 border-l-4 border-l-[#f6465d]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#f6465d] font-bold flex items-center gap-1">
                                            <MdTrendingDown size={18} />
                                            PUT
                                        </h3>
                                        <span className="text-xs text-[#848e9c] font-mono">Theoretical</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="block text-xs text-[#848e9c] uppercase font-bold tracking-wider mb-1">Price</span>
                                        <span className="text-3xl font-bold font-mono text-white">
                                            ${results.put.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <GreekItem label="Delta" value={results.put.delta.toFixed(5)} />
                                        <GreekItem label="Gamma" value={results.gammaPut.toFixed(5)} />
                                        <GreekItem label="Theta" value={results.put.theta.toFixed(5)} />
                                        <GreekItem label="Vega" value={results.put.vega.toFixed(5)} />
                                        <GreekItem label="Rho" value={results.put.rho.toFixed(5)} />
                                    </div>
                                </div>
                            </div>

                            {/* IV Calculation Section */}
                            <div className="bg-[#2b3139] rounded-xl p-6 border border-[#474d57]">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="text-yellow-500">IV Calculation</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm text-[#848e9c]">Option</label>
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => setIvOptionType("call")}
                                                        className={`text-xs px-2 py-1 rounded ${ivOptionType === "call" ? "bg-[#2ebd85] text-white" : "text-[#848e9c] hover:bg-[#1e2329]"}`}
                                                    >Call</button>
                                                    <button 
                                                        onClick={() => setIvOptionType("put")}
                                                        className={`text-xs px-2 py-1 rounded ${ivOptionType === "put" ? "bg-[#f6465d] text-white" : "text-[#848e9c] hover:bg-[#1e2329]"}`}
                                                    >Put</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm text-[#848e9c]">Market Option Price</label>
                                                <div className="flex gap-3 items-center">
                                                    {["Last", "Bid", "Ask"].map((type) => (
                                                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name="priceType"
                                                                checked={priceType === type.toLowerCase()}
                                                                onChange={() => setPriceType(type.toLowerCase() as "last" | "bid" | "ask")}
                                                                className="w-3 h-3 accent-yellow-500"
                                                            />
                                                            <span className="text-[10px] text-[#848e9c]">{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <input 
                                                type="number"
                                                value={marketPriceInput}
                                                onChange={(e) => setMarketPriceInput(e.target.value)}
                                                className="w-full bg-[#1e2329] border border-[#474d57] text-white rounded-lg px-4 py-2 outline-none focus:border-yellow-500 font-mono text-right"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end items-end">
                                        <span className="text-[10px] text-[#848e9c] uppercase font-bold mb-1">Implied Volatility</span>
                                        <span className="text-3xl font-bold font-mono text-yellow-500">
                                            {results.calculatedIV !== null ? results.calculatedIV.toFixed(2) : "--.--"}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <p className="text-[11px] text-[#848e9c] leading-relaxed">
                    <span className="text-yellow-500 font-bold uppercase mr-1">Note:</span> 
                    Using {dayCountConvention === 252 ? "252 trading days" : "365 calendar days"} convention with {
                        pricingModel === "bsm" ? "Black-Scholes (European)" : 
                        pricingModel === "binomial-crr" ? "Cox-Ross-Rubinstein binomial (American)" :
                        "Leisen-Reimer binomial (American)"
                    } model. CRR with 252-day convention typically matches Barchart and other major platforms. 
                    Real market conditions may vary. For educational purposes only.
                </p>
            </div>
        </div>
    )
}

const GreekItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <span className="block text-[10px] text-[#848e9c] uppercase font-bold">{label}</span>
        <span className="text-white font-mono text-sm">{value}</span>
    </div>
)

export default OptionsCalculator