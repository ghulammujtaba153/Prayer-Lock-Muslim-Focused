"use client"

import React from "react"
import { HiChartBar } from "react-icons/hi2"

const Step7 = ({
    convictionSource,
    setConvictionSource,
}: {
    convictionSource: string
    setConvictionSource: (source: string) => void
}) => {
    const sources = [
        "Paid Trading Group",
        "Youtube/Tiktok/Instagram Influencer",
        "News",
        "Friends or Community",
        "Technical Setup",
        "A Feeling",
    ]

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiChartBar className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                before entering a trade where does your conviction come from?
            </h1>
            <div className="flex flex-col gap-3 w-full max-w-md">
                {sources.map((source) => (
                    <button
                        key={source}
                        onClick={() => setConvictionSource(source)}
                        className={`w-full p-4 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
                            convictionSource === source
                                ? "bg-accent text-white shadow-lg shadow-accent/40 scale-105"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        {source}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Step7


