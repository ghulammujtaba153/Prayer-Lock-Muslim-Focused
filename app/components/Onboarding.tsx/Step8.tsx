"use client"

import React from "react"
import { HiShieldCheck } from "react-icons/hi2"

const Step8 = ({name}: {name: string}) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiShieldCheck className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {name} most trade retail traders don't trade the market
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                They trade someone else&apos;s opinion
            </p>
            <p>By the time you hear the idea</p>
            <p>Smart money already moved</p>

        </div>
    )
}

export default Step8
