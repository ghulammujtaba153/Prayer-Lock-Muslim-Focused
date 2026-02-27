"use client"

import React from "react"
import { HiGift } from "react-icons/hi2"

interface OnboardingData {
    name: string
    marketType: string
    convictionSource: string
    improvements: string[]
    checkFrequency: string
    obstacles: string[]
    emotionalFeeling: string
    emotionalIntensity: number
    motivationLevel: number
}

const Step14 = ({ name, data }: { name: string; data: OnboardingData }) => {
    return (
        <div className="flex flex-col items-center text-center w-full">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiGift className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                thanks {name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mb-8">
                here is what you shared with us
            </p>

            {/* Summary Container */}
            <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-6">
                {/* Market Type */}
                {data.marketType && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            What you mostly trade
                        </h3>
                        <p className="text-lg font-bold text-slate-900 dark:text-white bg-accent/10 p-3 rounded-lg">
                            {data.marketType}
                        </p>
                    </div>
                )}

                {/* Conviction Source */}
                {data.convictionSource && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            Your conviction source
                        </h3>
                        <p className="text-lg font-bold text-slate-900 dark:text-white bg-accent/10 p-3 rounded-lg">
                            {data.convictionSource}
                        </p>
                    </div>
                )}

                {/* Check Frequency */}
                {data.checkFrequency && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            How often you check the bigger picture
                        </h3>
                        <p className="text-lg font-bold text-slate-900 dark:text-white bg-accent/10 p-3 rounded-lg">
                            {data.checkFrequency}
                        </p>
                    </div>
                )}

                {/* Improvements */}
                {data.improvements.length > 0 && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
                            What you want to improve
                        </h3>
                        <div className="flex flex-col gap-2">
                            {data.improvements.map((improvement) => (
                                <div
                                    key={improvement}
                                    className="p-3 bg-accent/10 rounded-lg text-slate-900 dark:text-white font-semibold"
                                >
                                    ✓ {improvement}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Obstacles */}
                {data.obstacles.length > 0 && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
                            What gets in the way of good trades
                        </h3>
                        <div className="flex flex-col gap-2">
                            {data.obstacles.map((obstacle) => (
                                <div
                                    key={obstacle}
                                    className="p-3 bg-accent/10 rounded-lg text-slate-900 dark:text-white font-semibold"
                                >
                                    ✓ {obstacle}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Emotional Feeling */}
                {data.emotionalFeeling && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            How you&apos;re feeling (Emotional)
                        </h3>
                        <div className="flex items-center gap-3 bg-accent/10 p-3 rounded-lg">
                            <span className="text-4xl">{data.emotionalFeeling}</span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Intensity: {data.emotionalIntensity}/8</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Motivation Level */}
                {data.motivationLevel && (
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                            Your motivation level
                        </h3>
                        <div className="flex items-center gap-3 bg-accent/10 p-3 rounded-lg">
                            <span className="text-4xl">{motivationEmojis[data.motivationLevel - 1]}</span>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{data.motivationLevel}/8</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const motivationEmojis = ["😴", "😐", "🤔", "👍", "💪", "🔥", "⚡", "🚀"]

export default Step14

