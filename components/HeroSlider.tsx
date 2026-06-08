"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
        }, 5200);
    }, [images.length]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    const goTo = (idx: number) => {
        setCurrent(idx);
        startTimer();
    };

    if (!images.length) {
        return (
            <section className="relative flex min-h-[calc(100svh-116px)] items-end overflow-hidden bg-black text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,#050505,#191919)]" />
                <HeroCopy />
            </section>
        );
    }

    return (
        <section className="relative min-h-[calc(100svh-116px)] overflow-hidden bg-black text-white">
            <div
                className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.45,0,0.15,1)]"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {images.map((url, i) => (
                    <div key={url} className="relative min-w-full">
                        <Image
                            src={url}
                            alt="Zikiano campaign product"
                            fill
                            priority={i === 0}
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

            <HeroCopy />

            {images.length > 1 && (
                <div className="premium-container absolute inset-x-0 bottom-6 z-20 flex items-center justify-between gap-4 text-white">
                    <div className="hidden text-[10px] font-black uppercase tracking-[0.24em] text-white/55 sm:block">
                        Campaign {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    </div>
                    <div className="ml-auto flex gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Show slide ${i + 1}`}
                                className={`h-1.5 transition-all duration-300 ${
                                    i === current ? "w-14 bg-white" : "w-7 bg-white/30 hover:bg-white/60"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function HeroCopy() {
    return (
        <div className="premium-container relative z-10 flex min-h-[calc(100svh-116px)] items-end pb-20 pt-24 sm:pb-24">
            <div className="max-w-4xl">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.34em] text-zikiano-signal">
                    Handmade in South Africa
                </p>
                <h1 className="text-balance text-6xl font-black uppercase leading-[0.82] tracking-tight text-white sm:text-8xl lg:text-[8.5rem]">
                    ZIKIANO
                </h1>
                <p className="mt-7 max-w-xl text-sm font-semibold uppercase leading-6 tracking-[0.14em] text-white/75 sm:text-base">
                    South African handmade footwear crafted with premium supplied fruit leather. Bags, clothing, and everyday essentials next.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/shop"
                        className="inline-flex h-14 items-center justify-center gap-3 bg-white px-7 text-xs font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-zikiano-signal"
                    >
                        Shop the label
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex h-14 items-center justify-center border border-white/40 px-7 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                    >
                        New arrivals
                    </Link>
                </div>
            </div>
        </div>
    );
}
