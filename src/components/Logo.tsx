import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap: Record<string, { icon: string; text: string; gap: string }> = {
    sm: { icon: 'w-7 h-7', text: 'text-xl', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 'w-13 h-13', text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', gap: 'gap-3.5' },
  };

  const activeSize = (typeof size === 'string' && sizeMap[size]) ? sizeMap[size] : sizeMap.sm;

  return (
    <div className={`inline-flex items-end ${activeSize.gap} select-none ${className}`}>
      {/* Thumbs Up Icon: Filled with Deep Sky Blue */}
      <div className={`relative flex items-end justify-center shrink-0 ${activeSize.icon}`}>
        <svg
          viewBox="1 1.25 21.75 21.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-all duration-300 hover:scale-105"
        >
          {/* Hand & Thumb Body filled with Deep Sky Blue */}
          <path
            d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
            fill="#00BFFF"
            stroke="#00BFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wrist Cuff divider matching the screenshot */}
          <path
            d="M7 10v12"
            className="stroke-white dark:stroke-[#0f0f0f]"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography in the clean YouTube Video Style */}
      {showText && (
        <span className={`font-bold tracking-tight ${activeSize.text} leading-none drop-shadow-xs font-sans`}>
          buvaki
        </span>
      )}
    </div>
  );
};