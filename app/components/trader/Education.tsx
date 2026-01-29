import React, { useState } from 'react';
import { MdPlayCircleOutline, MdPlayArrow } from 'react-icons/md';
import EducationDetail from './EducationDetail';

const data = [
    "https://www.youtube.com/shorts/tvO21iW1yZ0",
    "https://www.youtube.com/shorts/uAHwonyQwsE",
    "https://www.youtube.com/shorts/ntL9efXgCUM",
    "https://www.youtube.com/shorts/tvO21iW1yZ0",
    "https://www.youtube.com/shorts/tvO21iW1yZ0"
];

const Education = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Helper to get thumbnail URL from YouTube ID
    const getThumbnailUrl = (url: string) => {
        const id = url.split('/').pop()?.split('?')[0];
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    };

    if (selectedIndex !== null) {
        return (
            <EducationDetail 
                videos={data} 
                initialIndex={selectedIndex} 
                onClose={() => setSelectedIndex(null)} 
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center md:text-left mb-10">
                <h1 className="text-3xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
                    <MdPlayCircleOutline className="text-yellow-500" />
                    Trading Education
                </h1>
                <p className="text-[#848e9c] max-w-2xl">
                    Master the markets with our curated selection of trading shorts. Learn strategies, risk management, and market analysis in bite-sized videos.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map((url, index) => (
                    <div 
                        key={index}
                        onClick={() => setSelectedIndex(index)}
                        className="group relative bg-[#1e2329] rounded-2xl overflow-hidden border border-[#2b2f36] shadow-xl transition-all duration-300 hover:border-yellow-500/50 hover:shadow-yellow-500/10 hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="aspect-[9/16] w-full relative">
                            <img 
                                src={getThumbnailUrl(url)} 
                                alt={`Trading Education Short ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <MdPlayArrow className="text-black text-3xl" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-t from-[#0b0e11] to-transparent">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase tracking-wider">
                                    Short
                                </span>
                                <span className="text-xs text-[#848e9c]">Video #{index + 1}</span>
                            </div>
                            <h3 className="text-sm font-medium text-white group-hover:text-yellow-500 transition-colors line-clamp-1">
                                Essential Trading Concept
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 p-6 bg-[#1e2329]/50 rounded-2xl border border-dashed border-[#2b2f36] text-center">
                <p className="text-[#848e9c] text-sm">
                    New educational content is added weekly. Stay tuned for more trading strategies and market insights.
                </p>
            </div>
        </div>
    );
};

export default Education;
