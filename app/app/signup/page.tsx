'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/authContext';
import { MdPerson, MdEmail, MdLock, MdPublic, MdTrendingUp, MdMonetizationOn, MdBarChart, MdShowChart, MdArrowForward, MdArrowBack } from 'react-icons/md';

export default function SignupPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    marketType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const validateStep1 = () => {
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
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && formData.country) setStep(3);
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
      await register(formData.name, formData.email, formData.password, formData.country, formData.marketType);
      setSuccessMessage('Welcome! Onboarding complete. Logging you in...');
      
      // Auto-login after registration
      await login(formData.email, formData.password);
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-light-bg via-light-card to-light-bg dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg transition-all duration-700">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                <p className="text-gray-600 dark:text-gray-400">Your portal to market intelligence</p>
              </div>
            <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
              <div className="space-y-5">
                <Input label="Full Name" name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} error={errors.name} icon={<MdPerson className="w-5 h-5" />} />
                <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} error={errors.email} icon={<MdEmail className="w-5 h-5" />} />
                <Input label="Password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} error={errors.password} icon={<MdLock className="w-5 h-5" />} />
                <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<MdLock className="w-5 h-5" />} />
                
                <Button onClick={handleNext} variant="primary" className="flex items-center justify-center gap-2">
                  Continue <MdArrowForward size={20} />
                </Button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account? <Link href="/signin" className="font-medium text-accent hover:text-accent-dark transition-colors">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Country Selection (Splash feel) */}
        {step === 2 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MdPublic className="w-10 h-10 text-accent animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Where are you from?</h1>
              <p className="text-gray-600 dark:text-gray-400">This helps us tailor your market insights</p>
            </div>
            <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/10">
              <div className="space-y-6">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Select Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Choose a country...</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleBack} variant="outline" className="w-1/3">Back</Button>
                  <Button onClick={handleNext} disabled={!formData.country} variant="primary" className="flex-1 flex items-center justify-center gap-2">
                    Next <MdArrowForward size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Market Interest */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What interests you?</h1>
              <p className="text-gray-600 dark:text-gray-400">Select your primary focus area</p>
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

        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}
