import React, { useState } from 'react';
import { archiveDb } from '../utils/archiveUtils';
import { Compass, Sparkles, Network, BookOpen, MapPin, Users, Skull, ChevronRight, Shield } from 'lucide-react';

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
  const [selectedCampaign, setSelectedCampaign] = useState<'all' | 'curse-of-strahd' | 'ra-golvek' | 'vyrun'>('all');

  const campaigns = [
    {
      id: 'curse-of-strahd',
      title: 'Curse of Strahd',
      tagline: 'Gothic Horror in the Mists of Barovia',
      summary: 'A mist-shrouded valley isolated from the multiverse, ruled over by the ancient vampire lord Strahd von Zarovich from Castle Ravenloft.',
      theme: 'Gothic Horror, Survival, Mystery',
      color: 'border-rose-900/50 bg-rose-950/20 text-rose-300',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      icon: <Skull className="w-5 h-5 text-rose-400" />,
      ruleLink: 'campaigns/curse-of-strahd/rules/alterations-to-magic',
      hubLink: 'campaigns/curse-of-strahd/index'
    },
    {
      id: 'ra-golvek',
      title: "Ra Gol'vek",
      tagline: 'Coastal Kingdom Intrigue & Ancient Magics',
      summary: 'A realm of coastal ports, arcane guilds, and political power struggles caught between seafaring dangers and ancient awakenings.',
      theme: 'Intrigue, Nautical, High Magic',
      color: 'border-cyan-900/50 bg-cyan-950/20 text-cyan-300',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      ruleLink: 'campaigns/ra-golvek/rules/index',
      hubLink: 'campaigns/ra-golvek/index'
    },
    {
      id: 'vyrun',
      title: 'Vyrun',
      tagline: 'Frontier Exploration & Ancient Mysteries',
      summary: 'An untamed frontier territory filled with perilous wilderness, forgotten dungeons, and ancient primal powers awaiting rediscovery.',
      theme: 'Exploration, Wilderness, Discovery',
      color: 'border-emerald-900/50 bg-emerald-950/20 text-emerald-300',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      ruleLink: 'campaigns/vyrun/rules/index',
      hubLink: 'campaigns/vyrun/index'
    }
  ];

  // Campaign specific entries
  const campaignEntries = archiveDb.entries.filter(e => e.category === 'campaigns' || e.campaign_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>Worlds of Adventure</span>
            </div>
            <h1 className="font-fantasy text-3xl md:text-4xl font-bold text-slate-100">
              Campaigns & Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Select an active campaign to access world lore, unique house rules, NPCs, places, and session notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCharacterBuilder}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Character Builder</span>
            </button>
            <button
              onClick={onOpenGraph}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Network className="w-4 h-4 text-indigo-400" />
              <span>Knowledge Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {campaigns.map(camp => (
          <div
            key={camp.id}
            className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] ${camp.color}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  {camp.icon}
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${camp.badgeColor}`}>
                  {camp.theme}
                </span>
              </div>

              <div>
                <h3 className="font-fantasy font-bold text-xl text-slate-100">
                  {camp.title}
                </h3>
                <div className="text-xs font-medium text-amber-300/90 mt-0.5">
                  {camp.tagline}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {camp.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <button
                onClick={() => onNavigate(camp.hubLink)}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-200 transition-colors flex items-center justify-between"
              >
                <span>Enter Campaign Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate(camp.ruleLink)}
                className="w-full py-1.5 px-3 rounded-xl hover:bg-slate-950/60 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Special Rules & Alterations</span>
                <BookOpen className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaign Records Directory */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-fantasy text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Campaign Lore & Entries Directory</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaignEntries.slice(0, 15).map(entry => (
            <button
              key={entry.id}
              onClick={() => onNavigate(entry.id)}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                  {entry.title}
                </span>
                <span className="text-[10px] text-slate-500 uppercase shrink-0">
                  {entry.campaign_id || 'Campaign'}
                </span>
              </div>
              {entry.summary && (
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {entry.summary}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
