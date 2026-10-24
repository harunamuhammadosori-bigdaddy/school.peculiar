import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
}) => {
  const sizeMap = {
    sm: { box: 'w-9 h-9', icon: 36, textTitle: 'text-sm font-bold', textSub: 'text-[10px]' },
    md: { box: 'w-12 h-12', icon: 48, textTitle: 'text-base font-bold', textSub: 'text-xs' },
    lg: { box: 'w-16 h-16', icon: 64, textTitle: 'text-lg font-bold', textSub: 'text-xs' },
    xl: { box: 'w-24 h-24', icon: 96, textTitle: 'text-2xl font-bold', textSub: 'text-sm' },
  };

  const { box, textTitle, textSub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Authentic High-Detail School Crest Badge */}
      <div className={`relative flex-shrink-0 ${box} drop-shadow-sm`}>
        <svg viewBox="0 0 120 130" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Shield Outline */}
          <path
            d="M60 4 L110 20 V68 C110 98 60 124 60 124 C60 124 10 98 10 68 V20 L60 4 Z"
            fill="#064e3b"
            stroke="#eab308"
            strokeWidth="4"
          />
          {/* Inner Golden Border */}
          <path
            d="M60 12 L102 26 V66 C102 91 60 114 60 114 C60 114 18 91 18 66 V26 L60 12 Z"
            fill="#0f5132"
            stroke="#fde047"
            strokeWidth="1.5"
          />
          {/* Header Banner on Crest */}
          <rect x="22" y="24" width="76" height="12" rx="2" fill="#eab308" />
          <text x="60" y="33" textAnchor="middle" fill="#064e3b" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
            PECULIAR
          </text>

          {/* Central Heraldic Elements */}
          {/* Open Book */}
          <path
            d="M40 52 C48 50 56 52 60 55 C64 52 72 50 80 52 V69 C72 67 64 69 60 72 C56 69 48 67 40 69 Z"
            fill="#ffffff"
            stroke="#eab308"
            strokeWidth="1.5"
          />
          <line x1="60" y1="55" x2="60" y2="72" stroke="#064e3b" strokeWidth="1.5" />
          {/* Lines of wisdom on pages */}
          <line x1="45" y1="57" x2="55" y2="58" stroke="#064e3b" strokeWidth="0.8" />
          <line x1="45" y1="62" x2="55" y2="63" stroke="#064e3b" strokeWidth="0.8" />
          <line x1="65" y1="58" x2="75" y2="57" stroke="#064e3b" strokeWidth="0.8" />
          <line x1="65" y1="63" x2="75" y2="62" stroke="#064e3b" strokeWidth="0.8" />

          {/* Torch of Enlightenment */}
          <path d="M57 44 L63 44 L61 52 L59 52 Z" fill="#eab308" />
          {/* Flame */}
          <path d="M60 36 C63 39 64 41 62 43 C60 45 58 43 60 36 Z" fill="#ef4444" />
          <path d="M60 38 C61 40 62 41 61 43 C59 43 59 41 60 38 Z" fill="#fbbf24" />

          {/* Graduation Mortarboard Cap */}
          <polygon points="60,76 76,82 60,88 44,82" fill="#facc15" />
          <polygon points="50,84 50,89 70,89 70,84" fill="#ca8a04" />
          <line x1="72" y1="84" x2="76" y2="92" stroke="#ffffff" strokeWidth="1" />

          {/* Lower Ribbon Ribbon banner */}
          <path
            d="M20 98 L60 93 L100 98 L94 107 L60 102 L26 107 Z"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <text x="60" y="101" textAnchor="middle" fill="#064e3b" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
            DOMA • NASARAWA
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`tracking-tight ${textTitle} ${textColor}`}>
            PECULIAR COLLEGE
          </span>
          <span className={`font-semibold tracking-wider text-amber-600 ${textSub}`}>
            DOMA, NASARAWA STATE
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline-block">
            Nurturing Minds • Building Character
          </span>
        </div>
      )}
    </div>
  );
};
