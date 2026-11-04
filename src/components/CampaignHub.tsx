import React, { useState, useMemo } from 'react';
import { archiveDb, getEntryById } from '../utils/archiveUtils';
import { MarkdownView } from './MarkdownView';
import {
  Compass,
  MapPin,
  Users,
  Scroll,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface CampaignHubProps {
  initialCampaignId?: string;
  onNavigate: (entryId: string) => void;
  onOpenCharacterBuilder: () => void;
  onOpenGraph: (campaignId: string) => void;
}

const CAMPAIGNS = [
  {
    id: 'ra-golvek',
    title: "Ra Gol'vek",
    tagline: 'Coastal intrigue, ancient magic, and supernatural threats',
    indexId: 'campaigns/ra-golvek/index',
    rulesId: 'campaigns/ra-golvek/rules/index',
    theme: 'Political intrigue meets supernatural horror. High stakes and moral ambiguity.',
    conflicts: [
      'An ancient curse is slowly consuming the kingdom from within',
      'Political factions vie for power and control of trade routes',
      'A shadowy organization works to influence events',
      'Each player character has a hidden connection to these events'
    ]
  },
  {
    id: 'vyrun',
    title: 'Vyrun',
    tagline: 'Frontier exploration, survival, and ancient mysteries',
    indexId: 'campaigns/vyrun/index',
    rulesId: 'campaigns/vyrun/rules/index',
    theme: 'Untamed wilderness, lost ruins, harsh survival, and uncovering forgotten civilizations.',
    conflicts: [
      'Frontier factions fighting for scarce survival resources',
      'Ancient monoliths activating in the wild borderlands',
      'Dangerous eldritch beasts crossing into the frontier'
    ]
  },
  {
    id: 'curse-of-strahd',
    title: 'Curse of Strahd',
    tagline: 'Gothic horror in the mist-shrouded realm of Barovia',
    indexId: 'campaigns/curse-of-strahd/index',
    rulesId: 'campaigns/curse-of-strahd/rules/index',
    theme: 'Gothic terror, psychological dread, isolated realm cut off from planar travel.',
    conflicts: [
      'Strahd von Zarovich reigns supreme over the land',
      'The Mists trap all souls and corrupt magic manifestations',
      'Barovian villagers living in dread and despair'
    ]
  }
];

export const CampaignHub: React.FC<CampaignHubProps> = ({
  initialCampaignId = 'ra-golvek',
  onNavigate,
  onOpenCharacterBuilder,
  onOpenGraph
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(initialCampaignId);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'entries'>('overview');

  const currentCampaign = useMemo(() => {
    return CAMPAIGNS.find(c => c.id === selectedCampaignId) || CAMPAIGNS[0];
  }, [selectedCampaignId]);

  // Find all entries associated with this campaign
  const campaignEntries = useMemo(() => {
    return archiveDb.entries.filter(e => 
      e.campaign_id === currentCampaign.id ||
      e.path.startsWith(`campaigns/${currentCampaign.id}/`)
    );
  }, [currentCampaign]);

  const campaignIndexEntry = getEntryById(currentCampaign.indexId);

  // Group entries by type
  const rulesEntries = campaignEntries.filter(e => e.path.includes('/rules/'));
  const npcsAndPlaces = campaignEntries.filter(e => !e.path.includes('/rules/') && !e.id.endsWith('/index'));

  return (
    <div className="space-y-6">
      {/* Campaign Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CAMPAIGNS.map(camp => {
          const isSelected = camp.id === selectedCampaignId;
          return (
            <button
              key={camp.id}
              onClick={() => setSelectedCampaignId(camp.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/15 shadow-xl ring-1 ring-amber-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-fantasy text-lg font-bold text-slate-100">
                  {camp.title}
                </span>
                <Compass className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {camp.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Campaign Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>Active Campaign Setting</span>
            </div>
            <h1 className="font-fantasy text-3xl md:text-4xl font-bold text-slate-100">
              {currentCampaign.title}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {currentCampaign.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCharacterBuilder}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Build Character for this Campaign</span>
            </button>
            <button
              onClick={() => onOpenGraph(currentCampaign.id)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Explore Campaign Graph</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Campaign Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Campaign Overview
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Campaign Rulings ({rulesEntries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'entries'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>NPCs & Places ({npcsAndPlaces.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <h3 className="font-fantasy text-sm font-bold text-amber-300">
                  Setting Tone & Ambience
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentCampaign.theme}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <h3 className="font-fantasy text-sm font-bold text-amber-300">
                  Major Narrative Conflicts
                </h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {currentCampaign.conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {campaignIndexEntry && (
              <div className="pt-4 border-t border-slate-800">
                <MarkdownView content={campaignIndexEntry.body} onNavigate={onNavigate} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              House rules, madness saves, and setting-specific mechanics for {currentCampaign.title}.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rulesEntries.map(rule => (
                <div
                  key={rule.id}
                  onClick={() => onNavigate(rule.id)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 hover:bg-slate-800/40 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-fantasy font-bold text-slate-100 text-sm">
                      {rule.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {rule.summary || 'View specific campaign rule details and mechanics.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: NPCs & Places */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Characters, landmarks, and recorded encounters in {currentCampaign.title}.
            </div>

            {npcsAndPlaces.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                No individual campaign records created yet. Dungeon Masters can add custom characters and places.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {npcsAndPlaces.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => onNavigate(entry.id)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 hover:bg-slate-800/40 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-fantasy font-bold text-slate-100 text-sm">
                        {entry.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {entry.frontmatter.type || 'Entry'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {entry.summary || 'Click to view full entry.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
