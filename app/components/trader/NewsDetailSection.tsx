import React, { useEffect, useRef } from 'react';
import { MdClose, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';

interface NewsDetailSectionProps {
    videos: string[];
    initialIndex: number;
    onClose: () => void;
}

const NewsDetailSection: React.FC<NewsDetailSectionProps> = ({ videos, initialIndex, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeVideoIndex, setActiveVideoIndex] = React.useState<number>(initialIndex);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Scroll to the initial video index on mount
    useEffect(() => {
        if (containerRef.current) {
            const itemHeight = containerRef.current.offsetHeight;
            containerRef.current.scrollTo({
                top: itemHeight * initialIndex,
                behavior: 'instant'
            });
        }
    }, [initialIndex]);

    // Setup IntersectionObserver to track active video
    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6 // 60% of the video must be visible to be considered "active"
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    setActiveVideoIndex(index);
                }
            });
        }, options);

        // Target all video containers
        const targets = containerRef.current?.querySelectorAll('.video-card');
        targets?.forEach((target) => observerRef.current?.observe(target));

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    const getEmbedUrl = (url: string, isActive: boolean) => {
        const id = url.split('/').pop()?.split('?')[0];
        // Autoplay and mute/unmute logic should ideally be handled via API, 
        // but for simple iframes, we toggle the autoplay param.
        // If not active, we load it without autoplay (or with a paused state if supported)
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${isActive ? 1 : 0}&controls=0&rel=0&modestbranding=1&loop=1&playlist=${id}`;
    };

    const scrollBy = (direction: 'up' | 'down') => {
        if (containerRef.current) {
            const itemHeight = containerRef.current.offsetHeight;
            containerRef.current.scrollBy({
                top: direction === 'up' ? -itemHeight : itemHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            {/* Header / Close Button */}
            <div className="absolute top-6 left-6 z-[110] flex items-center gap-4">
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-95"
                >
                    <MdClose size={28} />
                </button>
                <div className="hidden md:block">
                    <h2 className="text-white font-bold text-xl">Trading Shorts</h2>
                    <p className="text-white/60 text-sm">Swipe up/down for more</p>
                </div>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[110] flex flex-col gap-4 opacity-0 md:opacity-100">
                <button 
                    onClick={() => scrollBy('up')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-90"
                >
                    <MdKeyboardArrowUp size={32} />
                </button>
                <button 
                    onClick={() => scrollBy('down')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-90"
                >
                    <MdKeyboardArrowDown size={32} />
                </button>
            </div>

            {/* Shorts Container */}
            <div 
                ref={containerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {videos.map((url, index) => (
                    <div 
                        key={index} 
                        data-index={index}
                        className="video-card w-full h-full snap-start flex items-center justify-center relative bg-black"
                    >
                        <div className="aspect-[9/16] h-full max-h-screen relative shadow-2xl shadow-yellow-500/10 border-x border-white/5">
                            <iframe
                                src={getEmbedUrl(url, index === activeVideoIndex)}
                                title={`Trading Education Short ${index + 1}`}
                                className="w-full h-full border-0 pointer-events-auto"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                            
                            {/* Overlay info */}
                            <div className="absolute bottom-10 left-6 right-20 pointer-events-none">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                                        T
                                    </div>
                                    <span className="text-white font-semibold">Trader Pro</span>
                                    <button className="ml-2 px-3 py-1 bg-white text-black text-xs font-bold rounded-full pointer-events-auto hover:bg-yellow-500 transition-colors">
                                        Follow
                                    </button>
                                </div>
                                <h3 className="text-white font-medium text-lg leading-snug drop-shadow-lg">
                                    Mastering the basics of technical analysis in 60 seconds #trading #crypto
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};


export default NewsDetailSection;
