"use client"

import React from "react"
import { HiBookOpen } from "react-icons/hi2"

const Step5 = ({name}: {name: string}) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
                <HiBookOpen className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Alright {name} consider this...
            </h1>
            
        </div>
    )
}

export default Step5
