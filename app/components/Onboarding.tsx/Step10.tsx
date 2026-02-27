"use client"

import React from "react"
import { HiCloudArrowUp } from "react-icons/hi2"

const Step10 = ({
    improvements,
    setImprovements,
}: {
    improvements: string[]
    setImprovements: (improvements: string[]) => void
}) => {
    const improvementOptions = [
        "Better Timing",
        "Stronger Conviction",
        "Fewer Emotional Trade",
        "Clear Market Direction",
        "Risk Control",
        "Understanding Macro",
    ]

    const toggleImprovement = (improvement: string) => {
        if (improvements.includes(improvement)) {
            setImprovements(improvements.filter((item) => item !== improvement))
        } else {
            setImprovements([...improvements, improvement])
        }
    }

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiCloudArrowUp className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                what do you want to improve in your trading?
            </h1>
            <div className="flex flex-col gap-3 w-full max-w-md">
                {improvementOptions.map((improvement) => (
                    <button
                        key={improvement}
                        onClick={() => toggleImprovement(improvement)}
                        className={`w-full p-4 rounded-2xl font-semibold transition-all duration-300 ${
                            improvements.includes(improvement)
                                ? "bg-accent text-white shadow-lg shadow-accent/40 scale-105"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        {improvement}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Step10


