import { useMemo, useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EntryDetail } from './components/EntryDetail';
import { CharacterBuilder } from './components/CharacterBuilder';
import { CampaignHub } from './components/CampaignHub';
import { ItemCatalogue } from './components/ItemCatalogue';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { getEntryById } from './utils/archiveUtils';

import { SpellCatalogue } from './components/SpellCatalogue';
import { BestiaryCatalogue } from './components/BestiaryCatalogue';
import { ChangelogModal } from './components/ChangelogModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DiceProvider } from './components/DiceRoller';
import { Sparkles, Search } from 'lucide-react';

export type AppView = 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells' | 'monsters';

export default function App() {
  const [view, setView] = useState<AppView>('reader');
  const [entryId, setEntryId] = useState<string | null>('index');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const entry = useMemo(() => entryId ? getEntryById(entryId) : undefined, [entryId]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (id: string) => {
    if (id === 'index' || id === 'home') {
      setView('reader');
      setEntryId('index');
      setSidebarOpen(false);
      return;
    }
    if (id === 'spells/index' || id === 'spells') {
      setView('spells');
      setEntryId(id);
      setSidebarOpen(false);
      return;
    }
    if (id === 'items/index' || id === 'items') {
      setView('items');
      setEntryId(id);
      setSidebarOpen(false);
      return;
    }
    if (id === 'monsters/index' || id === 'monsters' || id === 'bestiary') {
      setView('monsters');
      setEntryId('monsters/index');
      setSidebarOpen(false);
      return;
    }
    if (id === 'campaigns/index' || id === 'campaigns') {
      setView('campaigns');
      setEntryId(id);
      setSidebarOpen(false);
      return;
    }
    if (id === 'builder' || id === 'character-builder') {
      setView('builder');
      setEntryId('character-builder');
      setSidebarOpen(false);
      return;
    }
    if (id === 'graph' || id === 'knowledge-graph') {
      setView('graph');
      setEntryId('graph');
      setSidebarOpen(false);
      return;
    }
    setEntryId(id);
    setView('reader');
    setSidebarOpen(false);
  };

  return (
    <DiceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Mobile top bar */}
        <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none md:hidden">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-stone-200 shadow-lg"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              Menu
            </button>
            <button
              className="rounded-lg border border-amber-900/60 bg-slate-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-amber-300 shadow-lg flex items-center gap-1.5"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Quick search"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Search</span>
            </button>
          </div>
          <button
            className="rounded-lg border border-amber-900/60 bg-stone-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-amber-300 shadow-lg flex items-center gap-1.5"
            onClick={() => setChangelogOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>What's New</span>
          </button>
        </div>

        <Sidebar
          currentEntryId={entryId}
          currentView={view}
          onNavigateToEntry={navigate}
          onSetView={(nextView) => { setView(nextView); setSidebarOpen(false); }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenChangelog={() => setChangelogOpen(true)}
          onOpenSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="md:ml-72 min-h-screen p-4 md:p-8 pt-16 md:pt-8">
          {view === 'reader' && entry && <EntryDetail key={entry.id} entry={entry} onNavigate={navigate} />}
          {view === 'reader' && !entry && <div className="text-slate-400">Entry not found.</div>}
          {view === 'spells' && <SpellCatalogue onSelectSpell={navigate} />}
          {view === 'monsters' && <BestiaryCatalogue onSelectMonster={navigate} />}
          {view === 'builder' && <CharacterBuilder onNavigateToEntry={navigate} />}
          {view === 'items' && <ItemCatalogue onSelectItem={navigate} />}
          {view === 'campaigns' && <CampaignHub onNavigate={navigate} onOpenCharacterBuilder={() => setView('builder')} onOpenGraph={() => setView('graph')} />}
          {view === 'graph' && <KnowledgeGraph onSelectEntry={navigate} />}
        </main>

        <ChangelogModal
          isOpen={changelogOpen}
          onClose={() => setChangelogOpen(false)}
          onNavigate={navigate}
        />

        <CommandPaletteModal
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={navigate}
        />
      </div>
    </DiceProvider>
  );
}
