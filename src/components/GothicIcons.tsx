import React from 'react';

// Ornate Heraldic & Gothic Icons designed specifically for 5e D&D ambiance
export const GothicRaven: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 14c2-4 6-7 11-7 2 0 4 1 5 3-2 1-3 3-3 5 0 2 1 3 3 4-3 1-6 0-8-2-3 1-5 2-8 2 0-2 1-4 3-5-2 0-3 0-3 0z" fill="currentColor" fillOpacity="0.18" />
    <circle cx="16" cy="9" r="1" fill="currentColor" />
    <path d="M12 14c-1 3-3 6-7 7" />
    <path d="M14 16c1 2 2 4 4 5" />
    <path d="M18 10l3-1" />
  </svg>
);

export const GothicBat: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 7c-1.5-2.5-4-3-6-2-2.5 1.2-3.5 4.5-3 8 2-1 4-1 6 1 1-3 2-4 3-5 1 1 2 2 3 5 2-2 4-2 6-1 .5-3.5-.5-6.8-3-8-2-1-4.5-.5-6 2z" fill="currentColor" fillOpacity="0.18" />
    <circle cx="10.5" cy="8.5" r="0.6" fill="currentColor" />
    <circle cx="13.5" cy="8.5" r="0.6" fill="currentColor" />
    <path d="M10 16c1 2 1.5 3 2 4 .5-1 1-2 2-4" />
  </svg>
);

export const GothicChalice: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l-1 8a5 5 0 0 1-10 0L6 3z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 16v5" />
    <path d="M8 21h8" />
    <path d="M6 7h12" />
    <path d="M12 7v3" />
    <path d="M12 11c0 1-.8 1.8-1.5 2.5" strokeDasharray="1 1" />
  </svg>
);

export const CrossedSwords: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 19l4-4M3 21l2-2M4 18l2 2" />
    <path d="M19 19l-4-4M21 21l-2-2M20 18l-2 2" />
    <path d="M8 14L19 3l2 2-11 11" />
    <path d="M16 14L5 3 3 5l11 11" />
    <path d="M7 11l6-6" />
    <path d="M17 11l-6-6" />
  </svg>
);

export const SpellTome: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" fill="currentColor" fillOpacity="0.12" />
    <path d="M6 2v20" />
    <path d="M13 7l-2 3h4l-2 4" strokeWidth="1.8" />
    <circle cx="13" cy="10" r="4.5" strokeDasharray="2 2" opacity="0.6" />
  </svg>
);

export const DragonShield: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l8 3.5v6.5c0 5.5-3.5 10-8 12-4.5-2-8-6.5-8-12V5.5L12 2z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 6v12M8 10h8M9 14h6" opacity="0.7" />
    <path d="M12 2v20" opacity="0.4" />
  </svg>
);

export const RavenloftCrest: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M16 2l12 6v10c0 8-6 12-12 14C10 30 4 26 4 18V8l12-6z" fill="currentColor" fillOpacity="0.1" />
    <path d="M16 6l8 4v8c0 5-4 8-8 10-4-2-8-5-8-10v-8l8-4z" strokeOpacity="0.6" />
    {/* Raven silhouette inside crest */}
    <path d="M10 16c2-3 4-4 7-4 2 1 2 2 1 4 2 0 4 1 4 2-3 1-5 0-7-1-2 1-3 2-5 2 0-1 0-2 0-3z" fill="currentColor" />
    <circle cx="15.5" cy="14" r="0.7" fill="#f43f5e" />
    <path d="M16 22v4M14 24h4" strokeWidth="1.8" />
  </svg>
);

export const WaxSeal: React.FC<{ label?: string; className?: string }> = ({ label = 'V', className = 'w-7 h-7' }) => (
  <div className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-rose-700 via-rose-900 to-red-950 border-2 border-rose-600/80 shadow-[0_2px_8px_rgba(159,18,57,0.5)] ${className}`}>
    <span className="font-fantasy font-extrabold text-[11px] text-rose-200 select-none drop-shadow">
      {label}
    </span>
    <span className="absolute inset-0 rounded-full border border-rose-400/30" />
  </div>
);

export const DndFleuronDivider: React.FC<{ variant?: 'amber' | 'crimson' | 'iron'; className?: string }> = ({
  variant = 'amber',
  className = 'my-6'
}) => {
  const colorClasses = {
    amber: {
      line: 'from-transparent via-amber-700/60 to-transparent',
      glyph: 'text-amber-500/80',
      flourish: 'text-amber-600/70'
    },
    crimson: {
      line: 'from-transparent via-rose-900/80 to-transparent',
      glyph: 'text-rose-500/90',
      flourish: 'text-rose-700/80'
    },
    iron: {
      line: 'from-transparent via-stone-700/60 to-transparent',
      glyph: 'text-stone-400',
      flourish: 'text-stone-500'
    }
  }[variant];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div className={`h-[1px] w-full bg-gradient-to-r ${colorClasses.line}`} />
      <div className={`shrink-0 px-3 flex items-center gap-2 text-xs font-serif ${colorClasses.glyph}`}>
        <span className={colorClasses.flourish}>❖</span>
        <span>⚔</span>
        <span className={colorClasses.flourish}>❖</span>
      </div>
      <div className={`h-[1px] w-full bg-gradient-to-r ${colorClasses.line}`} />
    </div>
  );
};
