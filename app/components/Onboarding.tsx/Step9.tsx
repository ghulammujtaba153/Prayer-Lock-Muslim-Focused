import React from "react"
import { HiMoon } from "react-icons/hi2"

const Step9 = () => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiMoon className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                it doesn't have to be blind trust
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Gentle on the eyes. Use the app comfortably during Tahajjud or night reading.
            </p>
            <p>Confidence comes from clarity</p>
            <p>Clarity comes from organized data</p>
            <p>we help you see if your idea matches the environment</p>
        </div>
    )
}

export default Step9
