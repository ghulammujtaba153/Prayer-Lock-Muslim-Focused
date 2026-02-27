"use client"

import React from "react"
import { HiAcademicCap } from "react-icons/hi2"

const Step13 = ({name}: {name: string}) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiAcademicCap className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                Thank you for your honesty
            </p>

            <p>Better timing starts with awareness</p>

            <p>Structured macro data build conviction </p>
            <p>lets sharpen your edge</p>
            <p>we will help you trade with context</p>
        </div>
    )
}

export default Step13
