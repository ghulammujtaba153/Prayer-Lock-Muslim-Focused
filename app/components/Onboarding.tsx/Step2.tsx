import React from "react"
import { HiOutlineHandRaised } from "react-icons/hi2"

const Step2 = () => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiOutlineHandRaised className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Ever Feel like markets move and you don't know why?
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Price Jump
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Charts Break
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Volatility Hits
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Without Warning
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Your are not behind
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                You are just missing the macro view
            </p>
        </div>
    )
}

export default Step2
