'use client';

import React from 'react';

interface SkeletonLoaderProps {
  /**
   * Number of skeleton bars to display
   * @default 3
   */
  barCount?: number;
  
  /**
   * Width variant for the skeleton bars
   * @default 'medium'
   */
  width?: 'small' | 'medium' | 'large' | 'full';
  
  /**
   * Height of each skeleton bar in pixels
   * @default 20
   */
  barHeight?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function SkeletonLoader({
  barCount = 3,
  width = 'medium',
  barHeight = 20,
  className = '',
}: SkeletonLoaderProps) {
  const widthClasses = {
    small: 'w-24',
    medium: 'w-48',
    large: 'w-64',
    full: 'w-full',
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={`
            ${widthClasses[width]}
            h-${barHeight}
            bg-gray-800
            rounded-lg
            animate-pulse-fast
            ${index === 0 ? 'opacity-100' : index === 1 ? 'opacity-90' : 'opacity-80'}
          `}
          style={{ 
            height: `${barHeight}px`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
      
      {/* Screen reader only text */}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
