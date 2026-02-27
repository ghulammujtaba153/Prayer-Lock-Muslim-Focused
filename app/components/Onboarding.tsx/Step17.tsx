"use client"

import React from "react"
import { HiHeart } from "react-icons/hi2"

const Step17 = ({
    motivationLevel,
    setMotivationLevel,
}: {
    motivationLevel: number
    setMotivationLevel: (level: number) => void
}) => {
    const motivationEmojis = ["😴", "😐", "🤔", "👍", "💪", "🔥", "⚡", "🚀"]
    const motivationLabels = ["Not at all", "Barely", "Somewhat", "Good", "Very", "Highly", "Extremely", "Maximum"]

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiHeart className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                How are you feeling today?
            </h1>

            {/* Motivation Emoji Display */}
            <div className="mb-8">
                <p className="text-6xl animate-bounce">{motivationEmojis[motivationLevel - 1]}</p>
            </div>

            {/* Range Slider */}
            <div className="w-full max-w-sm px-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Motivation Level
                    </label>
                    <span className="text-accent font-bold text-lg">{motivationLevel}/8</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="8"
                    value={motivationLevel}
                    onChange={(e) => setMotivationLevel(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-accent"
                    style={{
                        background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((motivationLevel - 1) / 7) * 100}%, #e2e8f0 ${((motivationLevel - 1) / 7) * 100}%, #e2e8f0 100%)`,
                    }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Not Motivated</span>
                    <span>Highly Motivated</span>
                </div>
            </div>

            {/* Motivation Label */}
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                Status: <span className="text-accent">{motivationLabels[motivationLevel - 1]}</span>
            </p>
        </div>
    )
}

export default Step17
