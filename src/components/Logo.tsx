import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-xl', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 'w-13 h-13', text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', gap: 'gap-3.5' },
  };

  return (
    <div className={`inline-flex items-center ${sizeMap[size].gap} select-none ${className}`}>
      {/* Viewfinder Media Play Icon in YouTube Vibrant Coral-Pink Style */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size].icon}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-all duration-300 hover:scale-105"
        >
          <defs>
            {/* Vibrant Coral-Pink Gradient (YouTube badge style) */}
            <linearGradient id="bv_yt_coral" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff3366" />
              <stop offset="50%" stopColor="#ff235a" />
              <stop offset="100%" stopColor="#e61045" />
            </linearGradient>

            {/* Bright Rose-Pink Gradient (YouTube text style) */}
            <linearGradient id="bv_yt_rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff659c" />
              <stop offset="100%" stopColor="#ff4583" />
            </linearGradient>

            {/* Soft Ambient Neon Glow */}
            <filter id="bv_yt_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ff235a" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* 4 Outer Viewfinder Corner Brackets */}
          {/* Top-Left */}
          <path
            d="M 14 28 L 14 14 L 28 14"
            stroke="url(#bv_yt_coral)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_yt_glow)"
          />
          {/* Top-Right */}
          <path
            d="M 72 14 L 86 14 L 86 28"
            stroke="url(#bv_yt_coral)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_yt_glow)"
          />
          {/* Bottom-Left */}
          <path
            d="M 14 72 L 14 86 L 28 86"
            stroke="url(#bv_yt_coral)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_yt_glow)"
          />
          {/* Bottom-Right */}
          <path
            d="M 72 86 L 86 86 L 86 72"
            stroke="url(#bv_yt_coral)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_yt_glow)"
          />

          {/* Inner Square Frame */}
          <rect
            x="24"
            y="24"
            width="52"
            height="52"
            rx="3"
            stroke="url(#bv_yt_coral)"
            strokeWidth="4.2"
            fill="none"
            filter="url(#bv_yt_glow)"
          />

          {/* 4 Horizontal Feed / Frequency Bars */}
          <path
            d="M 31 36.5 L 69 36.5
               M 31 45.5 L 59 45.5
               M 31 54.5 L 65 54.5
               M 31 63.5 L 51 63.5"
            stroke="url(#bv_yt_rose)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* Centered Play Triangle with Rounded Vertices */}
          <path
            d="M 43 36.8 
               C 43 35.2 44.8 34.2 46.2 35.1 
               L 66.8 48.3 
               C 68.1 49.1 68.1 50.9 66.8 51.7 
               L 46.2 64.9 
               C 44.8 65.8 43 64.8 43 63.2 Z"
            fill="none"
            stroke="url(#bv_yt_coral)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_yt_glow)"
          />
        </svg>
      </div>

      {/* Brand Typography in the clean YouTube Video Rose-Pink Style */}
      {showText && (
        <span className={`font-bold tracking-tight ${sizeMap[size].text} text-[#ff5592] leading-none drop-shadow-sm font-sans`}>
          buvaki
        </span>
      )}
    </div>
  );
};