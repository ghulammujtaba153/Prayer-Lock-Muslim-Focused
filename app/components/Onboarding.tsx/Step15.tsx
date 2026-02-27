import React from "react"
import { HiCheckBadge } from "react-icons/hi2"

const Step15= () => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mb-8 scale-110 animate-pulse">
                <HiCheckBadge className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
               Small Step everyday
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Thank you for completing the onboarding. Click below to start your journey.
            </p>

            <img src="/graph.png" alt="" />

            {/* on continue show this popup */}
            <div>
                <h1>how it works?</h1>

                <ul>
                    <li>share your today feeling?</li>
                <li>See macro data</li>
                <li>build conviction</li>
                </ul>
                

                <p></p>
            </div>
        </div>
    )
}

export default Step15
