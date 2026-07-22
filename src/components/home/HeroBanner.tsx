'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  ctaText: string;
  link: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'WELCOME BONUS',
    subtitle: 'Get up to 100% deposit match on your first deposit!',
    badge: '1ST DEPOSIT MATCH',
    gradient: 'from-accent/20 to-purple/30 border-accent/20',
    ctaText: 'CLAIM NOW',
    link: '/promotions',
  },
  {
    id: 2,
    title: 'BB CRASH GAME',
    subtitle: 'Play our proprietary multiplayer crash game. Verify the results yourself.',
    badge: 'BC ORIGINAL',
    gradient: 'from-orange-500/10 to-rose-600/10 border-orange-500/20',
    ctaText: 'PLAY CRASH',
    link: '/games/crash',
  },
  {
    id: 3,
    title: 'VIP CLUB benefits',
    subtitle: 'Level up to claim exclusive bonuses, personal VIP hosts, and daily cashback.',
    badge: 'EXCLUSIVE PERKS',
    gradient: 'from-yellow-500/10 to-amber-600/10 border-yellow-500/20',
    ctaText: 'EXPLORE CLUB',
    link: '/profile',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-[220px] md:h-[280px] rounded-2xl overflow-hidden mb-8 border border-gray-800 bg-[#162531]/40 shadow-xl group">
      
      {/* Background slide wrapper */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} p-6 md:p-12 flex flex-col justify-center transition-all duration-500`}>
        
        {/* Banner Details */}
        <div className="max-w-md md:max-w-lg space-y-3 z-10">
          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
            {slide.badge}
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {slide.title}
          </h2>
          <p className="text-xs md:text-sm font-semibold text-gray-300 leading-relaxed max-w-sm md:max-w-md">
            {slide.subtitle}
          </p>
          <div className="pt-2">
            <Link href={slide.link}>
              <Button variant="primary" size="md" className="font-bold py-2.5 px-6 shadow-md tracking-wider">
                {slide.ctaText}
              </Button>
            </Link>
          </div>
        </div>

        {/* Circular/radial background glow overlay */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[radial-gradient(circle_at_bottom_right,rgba(0,231,1,0.06),transparent_70%)] hidden md:block" />
      </div>

      {/* Manual Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 border border-white/5 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 border border-white/5 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <ChevronRight size={16} />
      </button>

      {/* Pagination indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-200
              ${idx === currentSlide ? 'w-5 bg-accent' : 'w-1.5 bg-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
};
