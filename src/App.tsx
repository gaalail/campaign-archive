import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { EntryDetail } from './components/EntryDetail';
import { CharacterBuilder } from './components/CharacterBuilder';
import { CampaignHub } from './components/CampaignHub';
import { ItemCatalogue } from './components/ItemCatalogue';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { getEntryById } from './utils/archiveUtils';

import { SpellCatalogue } from './components/SpellCatalogue';

export type AppView = 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells';

export default function App() {
  const [view, setView] = useState<AppView>('reader');
  const [entryId, setEntryId] = useState<string | null>('index');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const entry = useMemo(() => entryId ? getEntryById(entryId) : undefined, [entryId]);

  const navigate = (id: string) => {
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
    setEntryId(id);
    setView('reader');
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <button
        className="fixed left-3 top-3 z-50 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        Menu
      </button>
      <Sidebar
        currentEntryId={entryId}
        currentView={view}
        onNavigateToEntry={navigate}
        onSetView={(nextView) => { setView(nextView); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="md:ml-72 min-h-screen p-4 md:p-8">
        {view === 'reader' && entry && <EntryDetail entry={entry} onNavigate={navigate} />}
        {view === 'reader' && !entry && <div className="text-slate-400">Entry not found.</div>}
        {view === 'spells' && <SpellCatalogue onSelectSpell={navigate} />}
        {view === 'builder' && <CharacterBuilder onNavigateToEntry={navigate} />}
        {view === 'items' && <ItemCatalogue onSelectItem={navigate} />}
        {view === 'campaigns' && <CampaignHub onNavigate={navigate} onOpenCharacterBuilder={() => setView('builder')} onOpenGraph={() => setView('graph')} />}
        {view === 'graph' && <KnowledgeGraph onSelectEntry={navigate} />}
      </main>
    </div>
  );
}
