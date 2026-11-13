import React, { useState } from 'react';
import { archiveDb } from '../utils/archiveUtils';
import {
  GothicRaven,
  GothicBat,
  GothicChalice,
  CrossedSwords,
  SpellTome,
  DragonShield,
  RavenloftCrest,
  WaxSeal,
  DndFleuronDivider
} from './GothicIcons';
import { Compass, BookOpen, MapPin, Skull, ChevronRight, Sparkles, Network, Flame, ShieldAlert, Anchor, Sun } from 'lucide-react';

interface CampaignHubProps {
  onNavigate: (id: string) => void;
  onOpenCharacterBuilder: () => void;
  onOpenGraph: () => void;
}

export const CampaignHub: React.FC<CampaignHubProps> = ({
  onNavigate,
  onOpenCharacterBuilder,
  onOpenGraph
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'curse-of-strahd' | 'ra-golvek' | 'vyrun'>('all');

  const campaignEntries = archiveDb.entries.filter(e => e.category === 'campaigns' || e.campaign_id);

  const filteredEntries = selectedFilter === 'all'
    ? campaignEntries
    : campaignEntries.filter(e => e.campaign_id === selectedFilter || e.path.includes(selectedFilter));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Ancient Chronicles & Worlds Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-900/50 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 p-6 md:p-9 shadow-2xl">
        {/* Subtle decorative corner flourishes */}
        <div className="absolute top-2 left-2 text-amber-700/40 text-xs font-serif select-none">╔</div>
        <div className="absolute top-2 right-2 text-amber-700/40 text-xs font-serif select-none">╗</div>
        <div className="absolute bottom-2 left-2 text-amber-700/40 text-xs font-serif select-none">╚</div>
        <div className="absolute bottom-2 right-2 text-amber-700/40 text-xs font-serif select-none">╝</div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-serif tracking-widest uppercase text-amber-500 font-semibold">
              <CrossedSwords className="w-4 h-4 text-amber-400" />
              <span>The Grand Campaign Archives • 5th Edition</span>
            </div>
            <h1 className="font-fantasy text-3xl md:text-5xl font-bold tracking-tight text-amber-100 drop-shadow-md">
              Worlds of Blood & Myth
            </h1>
            <p className="text-stone-400 text-sm md:text-base max-w-2xl leading-relaxed font-sans">
              Chronicles, regional house rules, dramatis personae, and cartographic notes from our running table sagas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCharacterBuilder}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 hover:from-amber-500 hover:to-amber-400 font-fantasy font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/60 border border-amber-400/40"
            >
              <CrossedSwords className="w-4 h-4" />
              <span>Forge a Hero</span>
            </button>
            <button
              onClick={() => onNavigate('pantheons')}
              className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-800/60 text-amber-200 text-xs font-serif uppercase tracking-wider transition-all flex items-center gap-2 shadow cursor-pointer"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Pantheons</span>
            </button>
            <button
              onClick={onOpenGraph}
              className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-serif uppercase tracking-wider transition-all flex items-center gap-2 shadow"
            >
              <Network className="w-4 h-4 text-amber-400" />
              <span>Living Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Three Great Campaign Tomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========================================================= */}
        {/* CURSE OF STRAHD - GOTHIC VAMPIRE HORROR TOME              */}
        {/* ========================================================= */}
        <div className="relative group rounded-2xl border-2 border-rose-900/60 bg-gradient-to-b from-stone-950 via-rose-950/30 to-stone-950 p-6 flex flex-col justify-between space-y-6 shadow-[0_4px_30px_rgba(136,19,55,0.22)] hover:border-rose-700 transition-all">
          {/* Gothic Mist Accent Glow */}
          <div className="absolute inset-0 bg-radial from-rose-900/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

          <div className="space-y-4 relative z-10">
            {/* Header: Crest + Wax Seal */}
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <RavenloftCrest className="w-7 h-7 text-rose-500" />
                <div>
                  <span className="font-serif tracking-widest uppercase text-[10px] text-rose-400 font-bold block">
                    Domain of Dread
                  </span>
                  <span className="text-[11px] text-stone-400 italic">Barovian Mists</span>
                </div>
              </div>
              <WaxSeal label="S" className="w-8 h-8" />
            </div>

            {/* Title & Gothic Inscription */}
            <div>
              <h2 className="font-fantasy text-2xl font-bold tracking-wide text-rose-100 group-hover:text-rose-200 transition-colors">
                Curse of Strahd
              </h2>
              <div className="font-serif italic text-xs text-rose-300/80 mt-1">
                "I am the Ancient. I am the Land. My beginnings are lost in darkness..."
              </div>
            </div>

            {/* Narrative Flavor Text */}
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              A mist-shrouded valley severed from the multiverse. Lord Strahd von Zarovich rules Barovia from the spires of Castle Ravenloft, hunting heroes who dared step into the fog.
            </p>

            {/* Gothic Traits */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-serif pt-1">
              <div className="bg-rose-950/50 border border-rose-900/40 rounded p-2 text-rose-200 flex items-center gap-1.5">
                <GothicBat className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Eternal Twilight</span>
              </div>
              <div className="bg-rose-950/50 border border-rose-900/40 rounded p-2 text-rose-200 flex items-center gap-1.5">
                <GothicChalice className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Souls Entrapped</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-rose-900/50 space-y-2 relative z-10">
            <button
              onClick={() => onNavigate('campaigns/curse-of-strahd/index')}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 hover:from-rose-900 hover:to-rose-800 border border-rose-700/80 text-xs font-fantasy font-bold uppercase tracking-wider text-rose-100 transition-all flex items-center justify-between shadow-md"
            >
              <span className="flex items-center gap-2">
                <GothicRaven className="w-4 h-4 text-rose-400" />
                <span>Enter Barovia Hub</span>
              </span>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>

            <button
              onClick={() => onNavigate('campaigns/curse-of-strahd/rules/alterations-to-magic')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-rose-950/50 text-[11px] font-serif text-rose-400/90 hover:text-rose-200 transition-colors flex items-center justify-between"
            >
              <span>Alterations to Magic in Ravenloft</span>
              <span className="text-[10px] uppercase tracking-wider">Gothic Laws →</span>
            </button>

            <button
              onClick={() => onNavigate('campaigns/curse-of-strahd/pantheon/index')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-rose-950/50 text-[11px] font-serif text-rose-300/90 hover:text-rose-100 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Faiths of Barovia (Morninglord & Night)</span>
              <span className="text-[10px] uppercase tracking-wider">Pantheon →</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RA GOL'VEK - COASTAL KINGDOM INTRIGUE & ARCANE TIDES      */}
        {/* ========================================================= */}
        <div className="relative group rounded-2xl border-2 border-cyan-900/60 bg-gradient-to-b from-stone-950 via-cyan-950/25 to-stone-950 p-6 flex flex-col justify-between space-y-6 shadow-[0_4px_30px_rgba(8,145,178,0.15)] hover:border-cyan-700 transition-all">
          <div className="space-y-4 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Anchor className="w-6 h-6 text-cyan-400" />
                <div>
                  <span className="font-serif tracking-widest uppercase text-[10px] text-cyan-400 font-bold block">
                    Seafaring & Intrigue
                  </span>
                  <span className="text-[11px] text-stone-400 italic">Abyssal Currents</span>
                </div>
              </div>
              <div className="text-xs font-serif uppercase tracking-widest text-cyan-500 px-2 py-0.5 rounded border border-cyan-800/60 bg-cyan-950/40">
                Guildlands
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-fantasy text-2xl font-bold tracking-wide text-cyan-100 group-hover:text-cyan-200 transition-colors">
                Ra Gol'vek
              </h2>
              <div className="font-serif italic text-xs text-cyan-300/80 mt-1">
                "Where high guilds barter steel, tide-sorcery, and sovereignty."
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Coastal ports, competing mercantile houses, and forgotten ocean relics. Heroes navigate treacherous political waters as ancient primordial deeps awaken.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-serif pt-1">
              <div className="bg-cyan-950/50 border border-cyan-900/40 rounded p-2 text-cyan-200 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Nautical Arcana</span>
              </div>
              <div className="bg-cyan-950/50 border border-cyan-900/40 rounded p-2 text-cyan-200 flex items-center gap-1.5">
                <DragonShield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Guild Warfare</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-cyan-900/50 space-y-2 relative z-10">
            <button
              onClick={() => onNavigate('campaigns/ra-golvek/index')}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-950 via-cyan-900 to-cyan-950 hover:from-cyan-900 hover:to-cyan-800 border border-cyan-700/80 text-xs font-fantasy font-bold uppercase tracking-wider text-cyan-100 transition-all flex items-center justify-between shadow-md"
            >
              <span>Explore Ra Gol'vek</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => onNavigate('campaigns/ra-golvek/rules/index')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-cyan-950/50 text-[11px] font-serif text-cyan-400/90 hover:text-cyan-200 transition-colors flex items-center justify-between"
            >
              <span>Coastal Treaties & House Rules</span>
              <span className="text-[10px] uppercase tracking-wider">Codex →</span>
            </button>

            <button
              onClick={() => onNavigate('campaigns/ra-golvek/pantheon/index')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-cyan-950/50 text-[11px] font-serif text-cyan-300/90 hover:text-cyan-100 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>The Tide-Sworn & Sunken Court</span>
              <span className="text-[10px] uppercase tracking-wider">Pantheon →</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VYRUN - PRIMAL UNTAMED FRONTIER                           */}
        {/* ========================================================= */}
        <div className="relative group rounded-2xl border-2 border-emerald-900/60 bg-gradient-to-b from-stone-950 via-emerald-950/25 to-stone-950 p-6 flex flex-col justify-between space-y-6 shadow-[0_4px_30px_rgba(5,150,105,0.15)] hover:border-emerald-700 transition-all">
          <div className="space-y-4 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <Flame className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="font-serif tracking-widest uppercase text-[10px] text-emerald-400 font-bold block">
                    Untamed Frontier
                  </span>
                  <span className="text-[11px] text-stone-400 italic">Primal Wilderness</span>
                </div>
              </div>
              <div className="text-xs font-serif uppercase tracking-widest text-emerald-500 px-2 py-0.5 rounded border border-emerald-800/60 bg-emerald-950/40">
                Pioneer Realm
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-fantasy text-2xl font-bold tracking-wide text-emerald-100 group-hover:text-emerald-200 transition-colors">
                Vyrun
              </h2>
              <div className="font-serif italic text-xs text-emerald-300/80 mt-1">
                "Beyond the border forts lie primordial ruins and beast-gods."
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              A dangerous wilderness frontier awaiting brave expeditions. Ancient megaliths, primeval beasts, and lost dungeons challenge those carving civilization from the wild.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-serif pt-1">
              <div className="bg-emerald-950/50 border border-emerald-900/40 rounded p-2 text-emerald-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Expeditions</span>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-900/40 rounded p-2 text-emerald-200 flex items-center gap-1.5">
                <SpellTome className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Lost Megaliths</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-900/50 space-y-2 relative z-10">
            <button
              onClick={() => onNavigate('campaigns/vyrun/index')}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-800 border border-emerald-700/80 text-xs font-fantasy font-bold uppercase tracking-wider text-emerald-100 transition-all flex items-center justify-between shadow-md"
            >
              <span>Venture into Vyrun</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => onNavigate('campaigns/vyrun/rules/index')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-emerald-950/50 text-[11px] font-serif text-emerald-400/90 hover:text-emerald-200 transition-colors flex items-center justify-between"
            >
              <span>Wilderness Survival Rules</span>
              <span className="text-[10px] uppercase tracking-wider">Manual →</span>
            </button>

            <button
              onClick={() => onNavigate('campaigns/vyrun/pantheon/index')}
              className="w-full py-1.5 px-3 rounded-lg hover:bg-emerald-950/50 text-[11px] font-serif text-emerald-300/90 hover:text-emerald-100 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>The Reawakened Old Gods</span>
              <span className="text-[10px] uppercase tracking-wider">Pantheon →</span>
            </button>
          </div>
        </div>
      </div>

      <DndFleuronDivider variant="amber" />

      {/* Campaign Archives Directory */}
      <div className="rounded-2xl border-2 border-stone-800 bg-stone-900/80 p-6 md:p-8 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-fantasy text-xl font-bold text-stone-100">
                Campaign Lore, Characters & Sessions Codex
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Filter documents by active campaign saga.
              </p>
            </div>
          </div>

          {/* Campaign Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            {[
              { id: 'all', label: 'All Chronicles' },
              { id: 'curse-of-strahd', label: 'Curse of Strahd' },
              { id: 'ra-golvek', label: "Ra Gol'vek" },
              { id: 'vyrun', label: 'Vyrun' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as typeof selectedFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-amber-600 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEntries.map(entry => {
            const isStrahdEntry = entry.campaign_id === 'curse-of-strahd' || entry.path.includes('curse-of-strahd');
            return (
              <button
                key={entry.id}
                onClick={() => onNavigate(entry.id)}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 group ${
                  isStrahdEntry
                    ? 'bg-stone-950/80 border-rose-950/60 hover:border-rose-600 hover:bg-rose-950/20'
                    : 'bg-stone-950/80 border-stone-800/80 hover:border-amber-500/50 hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif font-bold text-stone-200 group-hover:text-amber-300 text-sm transition-colors truncate">
                    {entry.title}
                  </h4>
                  {isStrahdEntry ? (
                    <span className="text-[10px] font-serif uppercase tracking-wider text-rose-400 shrink-0">
                      Barovia
                    </span>
                  ) : (
                    <span className="text-[10px] font-serif uppercase tracking-wider text-amber-500/80 shrink-0">
                      {entry.campaign_id?.replace('-', ' ') || 'Chronicle'}
                    </span>
                  )}
                </div>
                {entry.summary && (
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {entry.summary}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
