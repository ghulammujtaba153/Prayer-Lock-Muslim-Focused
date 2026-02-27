"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Step1 from "@/components/Onboarding.tsx/Step1"
import Step2 from "@/components/Onboarding.tsx/Step2"
import Step3 from "@/components/Onboarding.tsx/Step3"
import Step4 from "@/components/Onboarding.tsx/Step4"
import Step5 from "@/components/Onboarding.tsx/Step5"
import Step6 from "@/components/Onboarding.tsx/Step6"
import Step7 from "@/components/Onboarding.tsx/Step7"
import Step8 from "@/components/Onboarding.tsx/Step8"
import Step9 from "@/components/Onboarding.tsx/Step9"
import Step10 from "@/components/Onboarding.tsx/Step10"
import Step11 from "@/components/Onboarding.tsx/Step11"
import Step12 from "@/components/Onboarding.tsx/Step12"
import Step13 from "@/components/Onboarding.tsx/Step13"
import Step14 from "@/components/Onboarding.tsx/Step14"
import Step15 from "@/components/Onboarding.tsx/Step15"
import Step16 from "@/components/Onboarding.tsx/Step16"
import Step17 from "@/components/Onboarding.tsx/Step17"


const TOTAL_STEPS = 17

interface OnboardingData {
    name: string
    marketType: string
    convictionSource: string
    improvements: string[]
    checkFrequency: string
    obstacles: string[]
    emotionalFeeling: string
    emotionalIntensity: number
    motivationLevel: number
}

const OnboardingPage = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [data, setData] = useState<OnboardingData>({
        name: "",
        marketType: "",
        convictionSource: "",
        improvements: [],
        checkFrequency: "",
        obstacles: [],
        emotionalFeeling: "😊",
        emotionalIntensity: 5,
        motivationLevel: 5,
    })
    const router = useRouter()

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Final step completed
            router.push("/")
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1 />
            case 2: return <Step2 />
            case 3: return <Step3 />
            case 4: return <Step4 name={data.name} setName={(name) => updateData({ name })} />
            case 5: return <Step5 name={data.name} />
            case 6: return <Step6 marketType={data.marketType} setMarketType={(type) => updateData({ marketType: type })} />
            case 7: return <Step7 convictionSource={data.convictionSource} setConvictionSource={(source) => updateData({ convictionSource: source })} />
            case 8: return <Step8 name={data.name} />
            case 9: return <Step9 />
            case 10: return <Step10 improvements={data.improvements} setImprovements={(improvements) => updateData({ improvements })} />
            case 11: return <Step11 checkFrequency={data.checkFrequency} setCheckFrequency={(freq) => updateData({ checkFrequency: freq })} />
            case 12: return <Step12 obstacles={data.obstacles} setObstacles={(obstacles) => updateData({ obstacles })} />
            case 13: return <Step13 name={data.name} />
            case 14: return <Step14 name={data.name} data={data} />
            case 15: return <Step15 />
            case 16: return <Step16 emotionalFeeling={data.emotionalFeeling} setEmotionalFeeling={(feeling) => updateData({ emotionalFeeling: feeling })} emotionalIntensity={data.emotionalIntensity} setEmotionalIntensity={(intensity) => updateData({ emotionalIntensity: intensity })} />
            case 17: return <Step17 motivationLevel={data.motivationLevel} setMotivationLevel={(level) => updateData({ motivationLevel: level })} />
            default: return <Step1 />
        }
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6 transition-colors duration-500">
            {/* Progress Bar Container */}
            <div className="w-full max-w-md mb-12 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        Step {currentStep} of {TOTAL_STEPS}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-accent transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content Container */}
            <div className="w-full max-w-2xl glass-card rounded-3xl p-8 md:p-12 mb-8 min-h-[400px] flex flex-col items-center justify-center animate-slide-up">
                <div className="w-full animate-fade-in">
                    {renderStep()}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {currentStep > 1 && (
                    <button 
                        onClick={prevStep}
                        className="flex-1 px-8 py-4 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 active:scale-95"
                    >
                        Back
                    </button>
                )}
                <button 
                    onClick={nextStep}
                    className="flex-[2] px-8 py-4 rounded-2xl font-bold text-white bg-accent shadow-lg shadow-accent/25 hover:bg-accent-dark hover:shadow-accent/40 transition-all duration-300 active:scale-95"
                >
                    Tap to continue
                </button>
            </div>
        </div>
    )
}

export default OnboardingPage
