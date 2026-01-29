"use client"

import React, { useState } from "react"
import Calculator from "@/components/trader/Calculator"
import Education from "@/components/trader/Education"
import Trends from "@/components/trader/Trends"
import { MdCalculate, MdSchool, MdTrendingUp } from "react-icons/md"

const TraderPage = () => {
    const [activeTab, setActiveTab] = useState<"calculator" | "education" | "trends">("calculator")

    return (
        <div className="min-h-screen text-[#eaecef]">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-[#1e2329] p-1 rounded-xl border border-[#2b2f36] shadow-xl">
                        <button
                            onClick={() => setActiveTab("calculator")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                activeTab === "calculator"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdCalculate size={20} />
                            Calculator
                        </button>
                        <button
                            onClick={() => setActiveTab("education")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
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
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                activeTab === "trends"
                                    ? "bg-[#2b3139] text-yellow-500 shadow-lg scale-105"
                                    : "text-[#848e9c] hover:text-white"
                            }`}
                        >
                            <MdTrendingUp size={20} />
                            Trends
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="transition-all duration-300">
                    {activeTab === "calculator" && <Calculator />}
                    {activeTab === "education" && <Education />}
                    {activeTab === "trends" && <Trends />}
                </div>
            </div>
        </div>
    )
}

export default TraderPage
