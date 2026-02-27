'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/authContext';
import { MdPerson, MdEmail, MdLock, MdPublic, MdTrendingUp, MdMonetizationOn, MdBarChart, MdShowChart, MdArrowForward } from 'react-icons/md';

// Import Onboarding Steps
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

const TOTAL_ONBOARDING_STEPS = 17;
const TOTAL_SIGNUP_FORM_STEPS = 2;
const TOTAL_STEPS = TOTAL_ONBOARDING_STEPS + TOTAL_SIGNUP_FORM_STEPS;

export default function SignupPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    marketType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [onboardingName, setOnboardingName] = useState('');
  
  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState({
    marketType: '',
    convictionSource: '',
    improvements: [] as string[],
    checkFrequency: '',
    obstacles: [] as string[],
    emotionalFeeling: '😊',
    emotionalIntensity: 5,
    motivationLevel: 5,
  });

  const updateOnboardingData = (updates: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'IN', name: 'India' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
  ];

  const marketTypes = [
    { id: 'Stocks', label: 'Stocks', icon: MdTrendingUp, color: 'bg-blue-500' },
    { id: 'Commodities', label: 'Commodities', icon: MdMonetizationOn, color: 'bg-yellow-600' },
    { id: 'Crypto', label: 'Crypto', icon: MdBarChart, color: 'bg-orange-500' },
    { id: 'Forex', label: 'Forex', icon: MdShowChart, color: 'bg-green-500' },
  ];

  const validateSignupStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // If we are in onboarding steps
    if (step < TOTAL_ONBOARDING_STEPS) {
      setStep(step + 1);
      return;
    }

    // Progression from final onboarding step to first signup form step
    if (step === TOTAL_ONBOARDING_STEPS) {
      setStep(step + 1);
      return;
    }

    // Signup form steps logic - only account info step requires validation
    const formStep = step - TOTAL_ONBOARDING_STEPS;
    if (formStep === 1 && validateSignupStep1()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marketType) {
      setErrors({ marketType: 'Please select a market type' });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Use onboarding name if form name is empty
      const finalName = formData.name || onboardingName;
      await register(finalName, formData.email, formData.password);
      setSuccessMessage('Welcome! Registration complete. Logging you in...');
      
      // Auto-login after registration
      await login(formData.email, formData.password);
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setErrors({
        submit: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const renderOnboardingStep = () => {
    switch (step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 name={onboardingName} setName={setOnboardingName} />;
      case 5: return <Step5 name={onboardingName} />;
      case 6: return <Step6 marketType={onboardingData.marketType} setMarketType={(type) => updateOnboardingData({ marketType: type })} />;
      case 7: return <Step7 convictionSource={onboardingData.convictionSource} setConvictionSource={(source) => updateOnboardingData({ convictionSource: source })} />;
      case 8: return <Step8 name={onboardingName} />;
      case 9: return <Step9 />;
      case 10: return <Step10 improvements={onboardingData.improvements} setImprovements={(improvements) => updateOnboardingData({ improvements })} />;
      case 11: return <Step11 checkFrequency={onboardingData.checkFrequency} setCheckFrequency={(freq) => updateOnboardingData({ checkFrequency: freq })} />;
      case 12: return <Step12 obstacles={onboardingData.obstacles} setObstacles={(obstacles) => updateOnboardingData({ obstacles })} />;
      case 13: return <Step13 name={onboardingName} />;
      case 14: return <Step14 name={onboardingName} data={{ name: onboardingName, marketType: onboardingData.marketType, convictionSource: onboardingData.convictionSource, improvements: onboardingData.improvements, checkFrequency: onboardingData.checkFrequency, obstacles: onboardingData.obstacles, emotionalFeeling: onboardingData.emotionalFeeling, emotionalIntensity: onboardingData.emotionalIntensity, motivationLevel: onboardingData.motivationLevel }} />;
      case 15: return <Step15 />;
      case 16: return <Step16 emotionalFeeling={onboardingData.emotionalFeeling} setEmotionalFeeling={(feeling) => updateOnboardingData({ emotionalFeeling: feeling })} emotionalIntensity={onboardingData.emotionalIntensity} setEmotionalIntensity={(intensity) => updateOnboardingData({ emotionalIntensity: intensity })} />;
      case 17: return <Step17 motivationLevel={onboardingData.motivationLevel} setMotivationLevel={(level) => updateOnboardingData({ motivationLevel: level })} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-light-bg via-light-card to-light-bg dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg transition-all duration-700">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Progress Indicator */}
        <div className="w-full max-w-md mb-12">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Step {step} of {TOTAL_STEPS}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {Math.round((step / TOTAL_STEPS) * 100)}% Complete
                </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
            </div>
        </div>

        {/* Onboarding Steps */}
        {step <= TOTAL_ONBOARDING_STEPS && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full glass-card rounded-3xl p-8 md:p-12 mb-8 min-h-[400px] flex flex-col items-center justify-center animate-slide-up">
              <div className="w-full animate-fade-in">
                {renderOnboardingStep()}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {step > 1 && (
                    <button 
                        onClick={handleBack}
                        className="flex-1 px-8 py-4 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 active:scale-95"
                    >
                        Back
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className="flex-[2] px-8 py-4 rounded-2xl font-bold text-white bg-accent shadow-lg shadow-accent/25 hover:bg-accent-dark hover:shadow-accent/40 transition-all duration-300 active:scale-95"
                >
                    Tap to continue
                </button>
            </div>
          </div>
        )}

        {/* Signup Form Steps (Steps 18, 19) */}
        {step > TOTAL_ONBOARDING_STEPS && (
          <div className="w-full max-w-md">
            {/* Step 18: Account Info */}
            {step === 18 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-400">Final few steps to get started</p>
                  </div>
                <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
                  <div className="space-y-5">
                    <Input label="Full Name" name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} error={errors.name} icon={<MdPerson className="w-5 h-5" />} />
                    <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} error={errors.email} icon={<MdEmail className="w-5 h-5" />} />
                    <Input label="Password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} error={errors.password} icon={<MdLock className="w-5 h-5" />} />
                    <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<MdLock className="w-5 h-5" />} />
                    
                    <div className="flex gap-4">
                      <Button onClick={handleBack} variant="outline" className="w-1/3">Back</Button>
                      <Button onClick={handleNext} variant="primary" className="flex-1 flex items-center justify-center gap-2">
                        Continue <MdArrowForward size={20} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account? <Link href="/signin" className="font-medium text-accent hover:text-accent-dark transition-colors">Sign in</Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 19: Market Interest */}
            {step === 19 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What interests you?</h1>
                  <p className="text-gray-600 dark:text-gray-400">Almost there!</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {marketTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.marketType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, marketType: type.id })}
                        className={`p-6 rounded-3xl text-left border-2 transition-all group relative overflow-hidden ${
                          isSelected 
                            ? 'border-accent bg-accent/5' 
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className={`p-3 rounded-2xl mb-4 w-fit ${type.color} bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110`}>
                          <Icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{type.label}</span>
                        {isSelected && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent" />}
                      </button>
                    );
                  })}
                </div>
                
                <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.submit}</p>
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4 text-center">
                      <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button onClick={handleBack} variant="outline" className="w-1/3">Back</Button>
                    <Button onClick={handleSubmit} loading={loading} disabled={!formData.marketType} variant="primary">
                      Complete Setup
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}

