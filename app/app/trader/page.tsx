"use client"

import React, { useState } from "react"
import Calculator from "@/components/trader/Calculator"
import Education from "@/components/trader/Education"
import Trends from "@/components/trader/Trends"
import OptionTrading from "@/components/trader/OptionTrading"
import GeminiSection from "@/components/trader/GeminiSection"
import { MdCalculate, MdSchool, MdTrendingUp, MdOutlineDonutLarge, MdQueryStats, MdAnalytics } from "react-icons/md"
import PerplexitySection from "@/components/trader/PerplexitySection"


const TraderPage = () => {
    const [activeTab, setActiveTab] = useState<"calculator" | "education" | "trends" | "options" | "markets" | "analysis">("calculator")

    return (
        <div className="min-h-screen text-[#eaecef]">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-[#1e2329] p-1 rounded-xl border border-[#2b2f36] shadow-xl overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("calculator")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "calculator"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdCalculate size={20} />
                            Futures
                        </button>
                        <button
                            onClick={() => setActiveTab("options")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "options"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdOutlineDonutLarge size={20} />
                            Options
                        </button>
                        <button
                            onClick={() => setActiveTab("education")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "education"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdSchool size={20} />
                            Education
                        </button>

                        <button
                            onClick={() => setActiveTab("trends")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "trends"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdTrendingUp size={20} />
                            Trends
                        </button>

                        <button
                            onClick={() => setActiveTab("markets")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "markets"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdQueryStats size={20} />
                            Markets
                        </button>

                        <button
                            onClick={() => setActiveTab("analysis")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                activeTab === "analysis"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdAnalytics size={20} />
                            Analysis
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="transition-all duration-300">
                    {activeTab === "calculator" && <Calculator />}
                    {activeTab === "options" && <OptionTrading />}
                    {activeTab === "education" && <Education />}
                    {activeTab === "trends" && <Trends />}
                    {activeTab === "markets" && <PerplexitySection />}
                    {activeTab === "analysis" && <GeminiSection />}
                </div>
            </div>
        </div>
    )
}

export default TraderPage
