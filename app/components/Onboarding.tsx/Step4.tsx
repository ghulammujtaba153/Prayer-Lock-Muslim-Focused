"use client"

import React from "react"
import { HiMapPin } from "react-icons/hi2"

const Step4 = ({ name, setName }: { name: string; setName: (name: string) => void }) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiMapPin className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                First thing first 
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm">
                what should we call you?
            </p>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-sm p-4 mt-4 bg-white dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-accent outline-none transition-all" 
            />
        </div>
    )
}

export default Step4
