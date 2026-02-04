import React from 'react';
import OptionsCalculator from './OptionsCalculator';
import { MdOutlineDonutLarge, MdInfoOutline } from 'react-icons/md';

const OptionTrading = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center md:text-left mb-10">
                <h1 className="text-3xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
                    <MdOutlineDonutLarge className="text-yellow-500" />
                    Options Trading
                </h1>
                <p className="text-[#848e9c] max-w-2xl">
                    Utilize our professional-grade Options Pricing Calculator to estimate fair values and manage your risk using Greeks. 
                    Perfect for hedging or speculative strategies.
                </p>
            </div>

            <OptionsCalculator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-[#1e2329]/50 p-6 rounded-2xl border border-[#2b2f36]">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <MdInfoOutline className="text-yellow-500" />
                        What is Delta?
                    </h3>
                    <p className="text-sm text-[#848e9c]">
                        Delta measures how much an option&apos;s price changes for every $1 move in the underlying asset. 
                        It also serves as a rough probability of the option expiring in-the-money.
                    </p>
                </div>
                <div className="bg-[#1e2329]/50 p-6 rounded-2xl border border-[#2b2f36]">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <MdInfoOutline className="text-yellow-500" />
                        What is Theta?
                    </h3>
                    <p className="text-sm text-[#848e9c]">
                        Theta represents time decay. It tells you how much value the option loses each day as it approaches expiration. 
                        Sellers benefit from high theta, while buyers lose from it.
                    </p>
                </div>
                <div className="bg-[#1e2329]/50 p-6 rounded-2xl border border-[#2b2f36]">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <MdInfoOutline className="text-yellow-500" />
                        What is Vega?
                    </h3>
                    <p className="text-sm text-[#848e9c]">
                        Vega measures sensitivity to volatility. It shows the change in option price for every 1% change in implied volatility. 
                        High IV increases both call and put prices.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OptionTrading;