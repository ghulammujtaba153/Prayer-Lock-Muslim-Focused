"use client"

import React from "react"
import { HiChatBubbleLeftRight } from "react-icons/hi2"

const Step12 = ({
    obstacles,
    setObstacles,
}: {
    obstacles: string[]
    setObstacles: (obstacles: string[]) => void
}) => {
    const obstacleOptions = [
        "Following Signals Blindly",
        "Entering too late",
        "Overtrading",
        "Emotional Decisions",
        "Fear of Missing Out",
        "Poor Timing",
    ]

    const toggleObstacle = (obstacle: string) => {
        if (obstacles.includes(obstacle)) {
            setObstacles(obstacles.filter((item) => item !== obstacle))
        } else {
            setObstacles([...obstacles, obstacle])
        }
    }

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiChatBubbleLeftRight className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                and what usually gets in the way of good trades?
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mb-6">
                You choose any that apply
            </p>
            <div className="flex flex-col gap-3 w-full max-w-md">
                {obstacleOptions.map((obstacle) => (
                    <button
                        key={obstacle}
                        onClick={() => toggleObstacle(obstacle)}
                        className={`w-full p-4 rounded-2xl font-semibold transition-all duration-300 ${
                            obstacles.includes(obstacle)
                                ? "bg-accent text-white shadow-lg shadow-accent/40 scale-105"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                        {obstacle}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Step12

