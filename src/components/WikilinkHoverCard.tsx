import React, { useState, useRef, useEffect } from 'react';
import { ArchiveEntry } from '../types/archive';
import { getSourceBadgeInfo, getRarityColor, cleanFlavorText, getSpellLevelLabel } from '../utils/archiveUtils';
import { BookOpen, Sparkles, Sword, Shield, ExternalLink, Flame } from 'lucide-react';
import { GothicBat, DragonShield } from './GothicIcons';

interface WikilinkHoverCardProps {
  entry: ArchiveEntry;
  children: React.ReactNode;
  onNavigate: (id: string) => void;
}

export const WikilinkHoverCard: React.FC<WikilinkHoverCardProps> = ({ entry, children, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({ top: 0, left: 0, placeAbove: false });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const popoverHeight = 220; // Estimated max height
        const spaceBelow = window.innerHeight - rect.bottom;
        const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

        const left = Math.max(12, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 332));
        const top = placeAbove ? rect.top - 8 : rect.bottom + 8;

        setCoords({ top, left, placeAbove });
        setIsOpen(true);
      }
    }, 180);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const badge = getSourceBadgeInfo(entry.source_type, entry.source);

  // Quick category icon
  const getCategoryIcon = () => {
    switch (entry.category) {
      case 'spells':
        return <Sparkles className="w-3.5 h-3.5 text-violet-400" />;
      case 'monsters':
        return <GothicBat className="w-3.5 h-3.5 text-rose-400" />;
      case 'items':
        return <DragonShield className="w-3.5 h-3.5 text-amber-400" />;
      case 'classes':
      case 'subclasses':
        return <Sword className="w-3.5 h-3.5 text-rose-400" />;
      case 'rules':
        return <BookOpen className="w-3.5 h-3.5 text-teal-400" />;
      case 'campaigns':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  // Extract quick metadata highlights
  const renderQuickStats = () => {
    if (entry.category === 'spells') {
      const levelText = getSpellLevelLabel(entry.level);
      const school = entry.school || 'Magic';
      const time = entry.casting_time || '1 action';
      const range = entry.range || 'Self';
      return (
        <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 bg-stone-950/70 rounded border border-stone-800 text-[11px] font-sans">
          <div><span className="text-stone-400">Level/School:</span> <span className="text-violet-300 font-semibold">{levelText} {school}</span></div>
          <div><span className="text-stone-400">Cast Time:</span> <span className="text-stone-200">{time}</span></div>
          <div><span className="text-stone-400">Range:</span> <span className="text-stone-200">{range}</span></div>
          <div><span className="text-stone-400">Duration:</span> <span className="text-stone-200">{entry.duration || 'Instantaneous'}</span></div>
        </div>
      );
    }

    if (entry.category === 'monsters') {
      const cr = entry.cr !== undefined ? `CR ${entry.cr}` : '';
      const ac = entry.frontmatter.ac || entry.frontmatter.armor_class;
      const hp = entry.frontmatter.hp || entry.frontmatter.hit_points;
      const type = entry.frontmatter.type || entry.frontmatter.monster_type || 'Creature';
      return (
        <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-stone-950/70 rounded border border-stone-800 text-[11px] font-sans">
          <div><span className="text-stone-400">Type:</span> <span className="text-rose-300 font-medium capitalize truncate block">{type}</span></div>
          <div><span className="text-stone-400">AC:</span> <span className="text-stone-100 font-bold">{ac || '—'}</span></div>
          <div><span className="text-stone-400">HP:</span> <span className="text-stone-100 font-bold">{hp || '—'}</span></div>
          {cr && <div className="col-span-3 text-amber-400/90 font-mono text-[10px] mt-0.5">{cr}</div>}
        </div>
      );
    }

    if (entry.category === 'items') {
      const rarity = entry.rarity || 'Common';
      const rarityColor = getRarityColor(rarity);
      const itemType = entry.item_type || 'Wondrous Item';
      return (
        <div className="flex items-center justify-between py-1.5 px-2 bg-stone-950/70 rounded border border-stone-800 text-[11px] font-sans">
          <span className="text-stone-300 capitalize">{itemType}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${rarityColor.bg} ${rarityColor.text} ${rarityColor.border}`}>
            {rarity}
          </span>
        </div>
      );
    }

    if (entry.category === 'classes') {
      const primaryStat = entry.frontmatter.primary_ability || entry.frontmatter.primary_stat || 'Custom';
      return (
        <div className="flex items-center justify-between py-1.5 px-2 bg-stone-950/70 rounded border border-stone-800 text-[11px] font-sans">
          <span className="text-stone-400">Hit Die: <strong className="text-stone-200 font-mono">{entry.hit_die || 'd8'}</strong></span>
          <span className="text-stone-400">Primary: <strong className="text-amber-300">{primaryStat}</strong></span>
        </div>
      );
    }

    return null;
  };

  const flavor = cleanFlavorText(entry.flavor || entry.frontmatter?.flavor || entry.summary);
  const excerpt = flavor || entry.summary || (entry.body || '').slice(0, 140).replace(/[#*`_[\]]/g, '').trim();

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline"
    >
      {children}

      {isOpen && (
        <span
          style={{
            position: 'fixed',
            top: coords.placeAbove ? 'auto' : `${coords.top}px`,
            bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : 'auto',
            left: `${coords.left}px`,
            width: '320px',
            zIndex: 9999
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="block animate-in fade-in zoom-in-95 duration-150 rounded-xl bg-stone-900 border border-amber-900/60 shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-3 text-left pointer-events-auto backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0">{getCategoryIcon()}</span>
              <div className="font-serif font-bold text-stone-100 text-sm truncate">
                {entry.title}
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 font-medium ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          {/* Quick stats block if applicable */}
          {renderQuickStats()}

          {/* Excerpt / Summary */}
          {excerpt && (
            <p className="text-xs text-stone-300 font-serif leading-relaxed line-clamp-3 mt-2 italic">
              "{excerpt}"
            </p>
          )}

          {/* Footer prompt */}
          <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-amber-500/80 font-mono">
            <span>Click link to view in Codex</span>
            <ExternalLink className="w-3 h-3 text-amber-400 opacity-70" />
          </div>
        </span>
      )}
    </span>
  );
};
