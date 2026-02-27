"use client"

import React from "react"
import { HiFaceSmile } from "react-icons/hi2"

const Step16 = ({
    emotionalFeeling,
    setEmotionalFeeling,
    emotionalIntensity,
    setEmotionalIntensity,
}: {
    emotionalFeeling: string
    setEmotionalFeeling: (feeling: string) => void
    emotionalIntensity: number
    setEmotionalIntensity: (intensity: number) => void
}) => {
    const emotions = ["😢", "😕", "😐", "🙂", "😊", "😄", "🥰", "😍"]
    const emotionLabels = ["Terrible", "Bad", "Okay", "Good", "Great", "Excellent", "Amazing", "Euphoric"]

    const handleSliderChange = (value: number) => {
        setEmotionalIntensity(value)
        setEmotionalFeeling(emotions[value - 1])
    }

    const currentIndex = emotionalIntensity

    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiFaceSmile className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                How are you Feeling
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-300 mb-12">
                Emotional Today?
            </h2>

            {/* Centered Emoji Display */}
            <div className="mb-12">
                <p className="text-8xl animate-bounce">{emotions[currentIndex - 1]}</p>
            </div>

            {/* Label */}
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-8">
                Feeling: <span className="text-accent text-2xl">{emotionLabels[currentIndex - 1] || "Select"}</span>
            </p>

            {/* Central Range Slider */}
            <div className="w-full max-w-sm px-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        Move slider to adjust
                    </label>
                    <span className="text-accent font-bold text-lg">{emotionalIntensity}/8</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="8"
                    value={emotionalIntensity}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-accent"
                    style={{
                        background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((emotionalIntensity - 1) / 7) * 100}%, #e2e8f0 ${((emotionalIntensity - 1) / 7) * 100}%, #e2e8f0 100%)`,
                    }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Sad</span>
                    <span>Happy</span>
                </div>
            </div>

            {/* Visual Indicator */}
            <div className="flex gap-1 justify-center">
                {emotions.map((emoji, index) => (
                    <span
                        key={emoji}
                        className={`text-2xl transition-opacity duration-300 ${
                            index + 1 <= currentIndex ? "opacity-100" : "opacity-30"
                        }`}
                    >
                        {emoji}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default Step16

