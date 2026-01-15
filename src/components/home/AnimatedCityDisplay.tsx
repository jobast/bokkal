'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { MapPin } from 'lucide-react';

interface AnimatedCityDisplayProps {
  cities: { key: string; label: string }[];
  compact?: boolean;
}

export function AnimatedCityDisplay({ cities, compact = false }: AnimatedCityDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Change city after fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cities.length);
        setIsVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [cities.length]);

  const currentCity = cities[currentIndex];
  const isOrange = currentIndex % 2 === 0;
  const pinColor = isOrange ? 'text-primary' : 'text-secondary';
  const textColor = isOrange ? 'text-primary' : 'text-secondary';

  if (compact) {
    return (
      <div className="flex flex-col items-center">
        <Link
          href={`/events?city=${currentCity.key}`}
          className="group relative"
        >
          <div className="flex flex-col items-center">
            <MapPin className={`h-4 w-4 transition-colors duration-300 ${pinColor}`} />
            <span
              className={`text-sm font-medium transition-all duration-300 ${textColor} ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              {currentCity.label}
            </span>
          </div>
        </Link>
        {/* Dots indicator */}
        <div className="flex gap-1 mt-2">
          {cities.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                index === currentIndex
                  ? (index % 2 === 0 ? 'bg-primary' : 'bg-secondary')
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-muted-foreground text-sm mb-3">Explorez</p>

      <Link
        href={`/events?city=${currentCity.key}`}
        className="group relative"
      >
        <div className="flex flex-col items-center">
          <MapPin className={`h-6 w-6 mb-1 transition-colors duration-300 ${pinColor}`} />
          <span
            className={`text-2xl font-bold transition-all duration-300 ${textColor} ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            {currentCity.label}
          </span>
        </div>
        <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isOrange ? 'bg-primary' : 'bg-secondary'}`} />
      </Link>

      {/* Dots indicator */}
      <div className="flex gap-1.5 mt-4">
        {cities.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentIndex
                ? (index % 2 === 0 ? 'bg-primary' : 'bg-secondary')
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      <p className="text-muted-foreground text-sm mt-4">
        et toute la Petite Côte
      </p>
    </div>
  );
}
