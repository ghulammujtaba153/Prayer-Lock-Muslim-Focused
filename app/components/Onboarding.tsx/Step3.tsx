import React from "react"
import { HiBellAlert } from "react-icons/hi2"

const Step3 = () => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiBellAlert className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                When the Us economy moves the world reacts
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Policy
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Inflation
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Rates
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Inflation
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Jobs
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Liquidity
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                this is what moves price
            </p>
        </div>
    )
}

export default Step3
