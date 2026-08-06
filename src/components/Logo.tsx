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
    sm: { icon: 'w-7 h-7', text: 'text-base' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl' },
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon floating directly with no frame or box */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size].icon}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="torLeftDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <linearGradient id="torRightPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>

          {/* Full Circle Base (Right Half Color) */}
          <circle cx="50" cy="50" r="48" fill="url(#torRightPurple)" />

          {/* Left Half (Dark Solid Purple) */}
          <path
            d="M 50 2 A 48 48 0 0 0 50 98 Z"
            fill="url(#torLeftDark)"
          />

          {/* Right Half Concentric White Onion Arcs */}
          {/* Outer Arc */}
          <path
            d="M 50 9.5 A 40.5 40.5 0 0 1 50 90.5"
            stroke="#ffffff"
            strokeWidth="5.5"
            fill="none"
          />
          {/* Middle Arc */}
          <path
            d="M 50 20.5 A 29.5 29.5 0 0 1 50 79.5"
            stroke="#ffffff"
            strokeWidth="5.5"
            fill="none"
          />
          {/* Inner Arc */}
          <path
            d="M 50 31.5 A 18.5 18.5 0 0 1 50 68.5"
            stroke="#ffffff"
            strokeWidth="5.5"
            fill="none"
          />
          {/* Core Semicircle */}
          <path
            d="M 50 42 A 8 8 0 0 1 50 58 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`font-black tracking-tight lowercase ${sizeMap[size].text} text-slate-100 leading-none`}>
          buvaki
        </span>
      )}
    </div>
  );
};

