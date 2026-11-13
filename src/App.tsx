import { useMemo, useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { EntryDetail } from './components/EntryDetail';
import { CharacterBuilder } from './components/CharacterBuilder';
import { CampaignHub } from './components/CampaignHub';
import { ItemCatalogue } from './components/ItemCatalogue';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { getEntryById } from './utils/archiveUtils';
import { SpellCatalogue } from './components/SpellCatalogue';
import { BestiaryCatalogue } from './components/BestiaryCatalogue';
import { PantheonCatalogue } from './components/PantheonCatalogue';
import { ChangelogModal } from './components/ChangelogModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DiceProvider } from './components/DiceRoller';
import { Sparkles, Search } from 'lucide-react';

export type AppView = 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'pantheons' | 'spells' | 'monsters';

interface ParsedRoute {
  view: AppView;
  entryId: string;
  anchor: string | null;
  params: Record<string, string>;
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function parseHashRoute(hashStr: string): ParsedRoute {
  const clean = hashStr.replace(/^#/, '').trim();
  if (!clean || clean === 'index' || clean === 'home') {
    return { view: 'reader', entryId: 'index', anchor: null, params: {} };
  }

  // Extract query parameters (?class=Paladin&focus=xyz&build=...==)
  const qIdx = clean.indexOf('?');
  const routePart = qIdx >= 0 ? clean.slice(0, qIdx) : clean;
  const queryPart = qIdx >= 0 ? clean.slice(qIdx + 1) : '';
  const params: Record<string, string> = {};
  if (queryPart) {
    // Strip trailing anchor if someone placed ?params#anchor
    const cleanQuery = queryPart.split('#')[0];
    cleanQuery.split('&').forEach(pair => {
      if (!pair) return;
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) {
        params[safeDecode(pair)] = '';
      } else {
        const k = pair.slice(0, eqIdx);
        const v = pair.slice(eqIdx + 1);
        if (k) params[safeDecode(k)] = safeDecode(v);
      }
    });
  }

  // Extract anchor (#oath-smites)
  const hashIdx = routePart.indexOf('#');
  const rawBaseRoute = hashIdx >= 0 ? routePart.slice(0, hashIdx) : routePart;
  const rawAnchor = hashIdx >= 0 ? routePart.slice(hashIdx + 1) : '';

  const baseRoute = safeDecode(rawBaseRoute).trim().replace(/^\/+|\/+$/g, '');
  const anchor = rawAnchor
    ? safeDecode(rawAnchor).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : null;

  if (!baseRoute || baseRoute === 'index' || baseRoute === 'home') {
    return { view: 'reader', entryId: 'index', anchor, params };
  }
  if (baseRoute === 'spells' || baseRoute === 'spells/index') {
    return { view: 'spells', entryId: 'spells/index', anchor: null, params };
  }
  if (baseRoute === 'monsters' || baseRoute === 'monsters/index' || baseRoute === 'bestiary') {
    return { view: 'monsters', entryId: 'monsters/index', anchor: null, params };
  }
  if (baseRoute === 'items' || baseRoute === 'items/index') {
    return { view: 'items', entryId: 'items/index', anchor: null, params };
  }
  if (baseRoute === 'campaigns' || baseRoute === 'campaigns/index') {
    return { view: 'campaigns', entryId: 'campaigns/index', anchor: null, params };
  }
  if (baseRoute === 'pantheons' || baseRoute === 'pantheons/index' || baseRoute === 'deities') {
    return { view: 'pantheons', entryId: 'pantheons', anchor: null, params };
  }
  if (baseRoute === 'builder' || baseRoute === 'character-builder') {
    return { view: 'builder', entryId: 'character-builder', anchor: null, params };
  }
  if (baseRoute === 'graph' || baseRoute === 'knowledge-graph') {
    return { view: 'graph', entryId: 'graph', anchor: null, params };
  }

  return { view: 'reader', entryId: baseRoute, anchor, params };
}

export default function App() {
  const initialRoute = useMemo(() => parseHashRoute(window.location.hash), []);
  const [view, setView] = useState<AppView>(initialRoute.view);
  const [entryId, setEntryId] = useState<string | null>(initialRoute.entryId);
  const [routeParams, setRouteParams] = useState<Record<string, string>>(initialRoute.params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const entry = useMemo(() => entryId ? getEntryById(entryId) : undefined, [entryId]);

  // Synchronize with Browser History (Back / Forward buttons & URL Hash)
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashRoute(window.location.hash);
      setView(parsed.view);
      setEntryId(parsed.entryId);
      setRouteParams(parsed.params);

      // Smooth scroll to anchor if present
      if (parsed.anchor) {
        setTimeout(() => {
          const el = document.getElementById(parsed.anchor!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const navigate = useCallback((target: string) => {
    const cleanTarget = target.replace(/^#/, '');
    const parsed = parseHashRoute(cleanTarget);

    // Update browser URL hash
    const nextHash = '#' + cleanTarget;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }

    setView(parsed.view);
    setEntryId(parsed.entryId);
    setRouteParams(parsed.params);
    setSidebarOpen(false);

    // Scroll to top or to anchor
    if (parsed.anchor) {
      setTimeout(() => {
        const el = document.getElementById(parsed.anchor!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSetView = useCallback((nextView: AppView) => {
    if (nextView === 'reader') {
      setView('reader');
      return;
    }
    navigate(nextView);
  }, [navigate]);

  return (
    <DiceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Mobile top bar */}
        <div className="fixed top-3 left-3 right-3 z-50 flex items-center justify-between pointer-events-none md:hidden">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-stone-200 shadow-lg cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              Menu
            </button>
            <button
              className="rounded-lg border border-amber-900/60 bg-slate-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-amber-300 shadow-lg flex items-center gap-1.5 cursor-pointer"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Quick search"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Search</span>
            </button>
          </div>
          <button
            className="rounded-lg border border-amber-900/60 bg-stone-900 px-3 py-2 pointer-events-auto text-xs font-serif font-semibold text-amber-300 shadow-lg flex items-center gap-1.5 cursor-pointer"
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
          onSetView={handleSetView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenChangelog={() => setChangelogOpen(true)}
          onOpenSearch={() => setCommandPaletteOpen(true)}
        />
        
        <main className="md:ml-72 min-h-screen p-4 md:p-8 pt-16 md:pt-8">
          {view === 'reader' && entry && (
            <EntryDetail
              key={entry.id}
              entry={entry}
              onNavigate={navigate}
              onBack={() => window.history.back()}
            />
          )}
          {view === 'reader' && !entry && (
            <div className="p-8 text-center text-stone-400 bg-stone-900 border border-stone-800 rounded-2xl max-w-lg mx-auto space-y-3">
              <h2 className="font-serif text-xl font-bold text-amber-200">Chronicle Page Not Found</h2>
              <p className="text-xs text-stone-400">
                The requested entry <code className="text-amber-400 font-mono">{entryId}</code> could not be found in the current codex.
              </p>
              <button
                onClick={() => navigate('index')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400"
              >
                Return to Home Hub
              </button>
            </div>
          )}
          {view === 'spells' && <SpellCatalogue onSelectSpell={navigate} />}
          {view === 'monsters' && <BestiaryCatalogue onSelectMonster={navigate} />}
          {view === 'builder' && (
            <CharacterBuilder
              onNavigateToEntry={navigate}
              initialParams={routeParams}
            />
          )}
          {view === 'items' && <ItemCatalogue onSelectItem={navigate} />}
          {view === 'campaigns' && (
            <CampaignHub
              onNavigate={navigate}
              onOpenCharacterBuilder={() => navigate('builder')}
              onOpenGraph={() => navigate('graph')}
            />
          )}
          {view === 'pantheons' && (
            <PantheonCatalogue
              onSelectEntry={navigate}
              initialCampaign={routeParams.campaign || 'all'}
            />
          )}
          {view === 'graph' && (
            <KnowledgeGraph
              onSelectEntry={navigate}
              initialFocusId={routeParams.focus || null}
            />
          )}
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
