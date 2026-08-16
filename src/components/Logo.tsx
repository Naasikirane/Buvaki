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
      {/* Symmetrical Buvaki Cat Play Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size].icon}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-all duration-300 hover:scale-105"
        >
          <defs>
            {/* Luminous Star Mint-Green Gradient for Cat Outline */}
            <linearGradient id="bv_star_green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22f4ad" />
              <stop offset="50%" stopColor="#05df9e" />
              <stop offset="100%" stopColor="#00c887" />
            </linearGradient>

            {/* Vibrant Orchid-Magenta Gradient for Play Button Outline */}
            <linearGradient id="bv_orchid_magenta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea79fb" />
              <stop offset="50%" stopColor="#e25bf8" />
              <stop offset="100%" stopColor="#c83de6" />
            </linearGradient>

            {/* Green Ambient Glow Filter */}
            <filter id="bv_green_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#05df9e" floodOpacity="0.4" />
            </filter>

            {/* Orchid-Magenta Glow Filter */}
            <filter id="bv_magenta_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#e25bf8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Symmetrical Cat Face Outline (Colorless / Transparent fill, Green stroke) */}
          <path
            d="M 50 33
               C 42 33 32 27.5 21 21.5
               C 18.5 20 16 22.5 17.5 25
               C 18.5 31.5 18 42 18 54
               C 18 72 32.3 86.5 50 86.5
               C 67.7 86.5 82 72 82 54
               C 82 42 81.5 31.5 82.5 25
               C 84 22.5 81.5 20 79 21.5
               C 68 27.5 58 33 50 33 Z"
            fill="none"
            stroke="url(#bv_star_green)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_green_glow)"
          />

          {/* Centered Play Button (Colorless / Transparent fill, Orchid-Magenta stroke) */}
          <path
            d="M 42 46.2 
               C 42 44.6 43.8 43.6 45.2 44.4 
               L 62.4 54.7 
               C 63.7 55.5 63.7 57.5 62.4 58.3 
               L 45.2 68.6 
               C 43.8 69.4 42 68.4 42 66.8 Z"
            fill="none"
            stroke="url(#bv_orchid_magenta)"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#bv_magenta_glow)"
          />
        </svg>
      </div>

      {/* Brand Typography - The word buvaki fully in orchid-magenta */}
      {showText && (
        <span className={`font-black tracking-tight lowercase ${sizeMap[size].text} text-[#e25bf8] leading-none drop-shadow-sm`}>
          buvaki
        </span>
      )}
    </div>
  );
};