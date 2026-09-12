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
      {/* Monitor Icon: Red Filled Rectangle, White Play Button & Stand Line */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size].icon}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-all duration-300 hover:scale-105"
        >
          {/* Monitor Screen: Filled with red, rounded corners, dark bezel stroke */}
          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="13.5"
            rx="3"
            fill="#ff0000"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* White Filled Play Button at Center of Rectangle */}
          <path
            d="M 10.2 6.5 C 10.2 6.1 10.6 5.85 11 6.1 L 15.2 8.75 C 15.55 8.95 15.55 9.45 15.2 9.65 L 11 12.3 C 10.6 12.55 10.2 12.3 10.2 11.9 Z"
            fill="#ffffff"
          />
          {/* Monitor Stand Base Line underneath */}
          <line
            x1="2.5"
            y1="20"
            x2="21.5"
            y2="20"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography in the clean YouTube Video Style */}
      {showText && (
        <span className={`font-bold tracking-tight ${sizeMap[size].text} leading-none drop-shadow-xs font-sans`}>
          buvaki
        </span>
      )}
    </div>
  );
};