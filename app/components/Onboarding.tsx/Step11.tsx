"use client"

import React from "react"
import { HiFire } from "react-icons/hi2"

const Step11 = ({
    checkFrequency,
    setCheckFrequency,
}: {
    checkFrequency: string
    setCheckFrequency: (frequency: string) => void
}) => {
    const frequencies = ["Never", "Rarely", "Sometimes", "Often", "Every time"]

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiFire className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                how often do you check the bigger picture before trading?
            </h1>
            <div className="flex flex-col gap-3 w-full max-w-md">
                {frequencies.map((frequency) => (
                    <button
                        key={frequency}
                        onClick={() => setCheckFrequency(frequency)}
                        className={`w-full p-4 rounded-2xl font-semibold transition-all duration-300 ${
                            checkFrequency === frequency
                                ? "bg-accent text-white shadow-lg shadow-accent/40 scale-105"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        {frequency}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Step11

