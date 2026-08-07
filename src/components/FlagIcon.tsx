import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-3.5 rounded-sm',
    md: 'w-7 h-5 rounded',
    lg: 'w-10 h-7 rounded-md',
    xl: 'w-14 h-10 rounded-lg',
  };

  const baseClasses = `inline-block shrink-0 object-cover overflow-hidden shadow-sm ring-1 ring-slate-700/40 ${sizeClasses[size]} ${className}`;

  switch (code.toLowerCase()) {
    case 'en':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#012169" />
          <path d="M0 0 L64 48 M64 0 L0 48" stroke="#FFFFFF" strokeWidth="8" />
          <path d="M0 0 L64 48 M64 0 L0 48" stroke="#C8102E" strokeWidth="4" />
          <path d="M32 0 V48 M0 24 H64" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M32 0 V48 M0 24 H64" stroke="#C8102E" strokeWidth="8" />
        </svg>
      );

    case 'es':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#AA151B" />
          <rect y="12" width="64" height="24" fill="#F1BF00" />
          <rect x="14" y="19" width="8" height="10" rx="1" fill="#AA151B" />
          <path d="M14 24 H22 M18 19 V29" stroke="#F1BF00" strokeWidth="1" />
          <circle cx="11" cy="24" r="1" fill="#333" />
          <circle cx="25" cy="24" r="1" fill="#333" />
        </svg>
      );

    case 'fr':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#002395" />
          <rect x="21.33" width="21.34" height="48" fill="#FFFFFF" />
          <rect x="42.67" width="21.33" height="48" fill="#ED2939" />
        </svg>
      );

    case 'de':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#111111" />
          <rect y="16" width="64" height="16" fill="#D00000" />
          <rect y="32" width="64" height="16" fill="#FFCE00" />
        </svg>
      );

    case 'ja':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#FFFFFF" />
          <circle cx="32" cy="24" r="13" fill="#BC002D" />
        </svg>
      );

    case 'zh':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#DE2910" />
          <path d="M14 8 L15.5 12 L20 12 L16.5 14.5 L18 19 L14 16 L10 19 L11.5 14.5 L8 12 L12.5 12 Z" fill="#FFDE00" />
          <path d="M23 7 L23.5 8.5 L25 8.5 L23.8 9.3 L24.2 10.8 L23 10 L21.8 10.8 L22.2 9.3 L21 8.5 L22.5 8.5 Z" fill="#FFDE00" />
          <path d="M26 12 L26.5 13.5 L28 13.5 L26.8 14.3 L27.2 15.8 L26 15 L24.8 15.8 L25.2 14.3 L24 13.5 L25.5 13.5 Z" fill="#FFDE00" />
          <path d="M26 18 L26.5 19.5 L28 19.5 L26.8 20.3 L27.2 21.8 L26 21 L24.8 21.8 L25.2 20.3 L24 19.5 L25.5 19.5 Z" fill="#FFDE00" />
          <path d="M23 23 L23.5 24.5 L25 24.5 L23.8 25.3 L24.2 26.8 L23 26 L21.8 26.8 L22.2 25.3 L21 24.5 L22.5 24.5 Z" fill="#FFDE00" />
        </svg>
      );

    case 'ar':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#000000" />
          <rect x="16" y="0" width="48" height="16" fill="#009739" />
          <rect x="16" y="16" width="48" height="16" fill="#FFFFFF" />
          <rect x="0" y="0" width="16" height="48" fill="#EF3340" />
        </svg>
      );

    case 'pt':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#009B3A" />
          <path d="M32 7 L57 24 L32 41 L7 24 Z" fill="#FEDF00" />
          <circle cx="32" cy="24" r="9.5" fill="#002776" />
          <path d="M23 26 C 27 22, 37 22, 41 26" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'hi':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#128807" />
          <rect y="0" width="64" height="16" fill="#FF9933" />
          <rect y="16" width="64" height="16" fill="#FFFFFF" />
          <circle cx="32" cy="24" r="5.5" stroke="#000080" strokeWidth="1.2" fill="none" />
          <circle cx="32" cy="24" r="1" fill="#000080" />
          <path d="M32 18.5 V29.5 M26.5 24 H37.5 M28 20 L36 28 M28 28 L36 20" stroke="#000080" strokeWidth="0.8" />
        </svg>
      );

    case 'sw':
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#006600" />
          <rect y="0" width="64" height="13" fill="#000000" />
          <rect y="13" width="64" height="2" fill="#FFFFFF" />
          <rect y="15" width="64" height="18" fill="#BB0000" />
          <rect y="33" width="64" height="2" fill="#FFFFFF" />
          <path d="M22 10 L42 38 M42 10 L22 38" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="32" cy="24" rx="5" ry="11" fill="#BB0000" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M32 13 V35" stroke="#FFFFFF" strokeWidth="1" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 48" className={baseClasses} xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" fill="#475569" />
          <text x="32" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="bold">
            {code.toUpperCase()}
          </text>
        </svg>
      );
  }
};
