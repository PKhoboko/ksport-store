"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

interface HeroSliderProps {
    images: string[];
}

export default function HeroSlider({ images }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (images.length <= 1) return;
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % images.length);
        }, 5000);
    }, [images.length]);

    useEffect(() => {
        startTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [startTimer]);

    const goTo = (idx: number) => {
        setCurrent(idx);
        startTimer();
    };

    if (!images.length) return <div className="h-[75vh] bg-zinc-950 animate-pulse" />;

    return (
        <section className="relative w-full overflow-hidden bg-zinc-950" style={{ height: '75vh' }}>
            {/* THE SLIDER TRACK */}
            <div
                className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.45,0,0.55,1)]"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {images.map((url, i) => (
                    <div key={url} className="relative min-w-full h-full">
                        <Image
                            src={url}
                            alt="Zikiano Hero"
                            fill
                            priority={i === 0}
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                ))}
            </div>

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 z-10 bg-black/50 pointer-events-none" />

            {/* TEXT CONTENT */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
                <p className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase mb-4">
                    Handcrafted in South Africa
                </p>
                <h1 className="text-6xl sm:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8]">
                    ZIKIANO.
                </h1>
                <p className="mt-8 text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] max-w-xs leading-relaxed font-bold">
                    High-performance gear. Premium Leather. <br/> Locally Made in Cape Town.
                </p>

                {/* SLIDE INDICATORS (DOTS) */}
                <div className="flex gap-3 mt-12">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-1.5 transition-all duration-500 rounded-full ${
                                i === current ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}