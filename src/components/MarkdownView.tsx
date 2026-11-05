import React, { useState } from 'react';
import { resolveWikilink, getSourceBadgeInfo } from '../utils/archiveUtils';
import { AlertTriangle, Info, Lightbulb, ShieldAlert, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { SpellCatalogue } from './SpellCatalogue';

interface MarkdownViewProps {
  content: string;
  onNavigate: (entryId: string) => void;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, onNavigate }) => {
  // Parse paragraphs, callouts, tables, and headers
  const elements = parseMarkdownBlocks(content);

  return (
    <div className="prose prose-invert max-w-none space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
      {elements.map((el, idx) => (
        <BlockRenderer key={idx} block={el} onNavigate={onNavigate} />
      ))}
    </div>
  );
};

interface Block {
  type: 'header' | 'callout' | 'table' | 'list' | 'paragraph' | 'divider' | 'code' | 'embed';
  target?: string;
  level?: number;
  title?: string;
  calloutType?: string;
  isFolded?: boolean;
  rows?: string[][];
  headers?: string[];
  items?: string[];
  rawText?: string;
  lang?: string;
}

function parseMarkdownBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // Header
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        rawText: headerMatch[2].trim()
      });
      i++;
      continue;
    }

    // Callout: > [!type]- Title or > [!type] Title
    const calloutMatch = line.match(/^>\s*\[!([a-zA-Z0-9_-]+)\]([+-]?)\s*(.*)$/);
    if (calloutMatch) {
      const calloutType = calloutMatch[1].toLowerCase();
      const isFolded = calloutMatch[2] === '-';
      const title = calloutMatch[3].trim() || calloutType.toUpperCase();
      const bodyLines: string[] = [];
      i++;

      while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
        const cleaned = lines[i].replace(/^>\s?/, '');
        bodyLines.push(cleaned);
        i++;
      }

      blocks.push({
        type: 'callout',
        calloutType,
        isFolded,
        title,
        rawText: bodyLines.join('\n')
      });
      continue;
    }

    // Table: starts with | ... |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0].slice(1, -1).split('|').map(s => s.trim());
        // line 1 is usually separator |---|---|
        const contentRows = tableLines.slice(2).map(r => r.slice(1, -1).split('|').map(s => s.trim()));
        blocks.push({
          type: 'table',
          headers: headerRow,
          rows: contentRows
        });
        continue;
      }
    }

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: 'code',
        lang,
        rawText: codeLines.join('\n')
      });
      continue;
    }

    // Unordered List
    if (/^\s*[-*+]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*+]\s+/, '').trim());
        i++;
      }
      blocks.push({
        type: 'list',
        items: listItems
      });
      continue;
    }

    // Obsidian embeds (spells.base, *-spells.base, etc.)
    const embedMatch = line.trim().match(/^!\[\[(.*?)\]\]$/);
    if (embedMatch) {
      blocks.push({
        type: 'embed',
        target: embedMatch[1].trim()
      });
      i++;
      continue;
    }

    // Regular paragraph
    if (line.trim() !== '') {
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].match(/^(#{1,6})\s+/) &&
        !lines[i].match(/^>\s*\[!/) &&
        !lines[i].trim().startsWith('|') &&
        !lines[i].trim().startsWith('```') &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^(\*\*\*|---|___)$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'paragraph',
        rawText: paraLines.join(' ')
      });
      continue;
    }

    i++;
  }

  return blocks;
}

const BlockRenderer: React.FC<{ block: Block; onNavigate: (id: string) => void }> = ({ block, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(!block.isFolded);

  if (block.type === 'divider') {
    return <hr className="border-slate-800 my-6" />;
  }

  if (block.type === 'embed' && block.target) {
    const target = block.target;
    // Check if it is a spell list
    if (target.endsWith('-spells.base') || target.startsWith('spells.base')) {
      let initialClass = 'All Spells';
      let initialLevel: number | 'all' = 'all';
      let hideClassSelector = false;

      if (target === 'wizard-spells.base') { initialClass = 'Wizard'; hideClassSelector = true; }
      else if (target === 'cleric-spells.base') { initialClass = 'Cleric'; hideClassSelector = true; }
      else if (target === 'druid-spells.base') { initialClass = 'Druid'; hideClassSelector = true; }
      else if (target === 'bard-spells.base') { initialClass = 'Bard'; hideClassSelector = true; }
      else if (target === 'paladin-spells.base') { initialClass = 'Paladin'; hideClassSelector = true; }
      else if (target === 'ranger-spells.base') { initialClass = 'Ranger'; hideClassSelector = true; }
      else if (target === 'sorcerer-spells.base') { initialClass = 'Sorcerer'; hideClassSelector = true; }
      else if (target === 'warlock-spells.base') { initialClass = 'Warlock'; hideClassSelector = true; }
      else if (target === 'artificer-spells.base') { initialClass = 'Artificer'; hideClassSelector = true; }
      else if (target === 'thanatomancer-spells.base') { initialClass = 'Thanatomancer'; hideClassSelector = true; }
      else if (target === 'tamer-spells.base') { initialClass = 'Tamer'; hideClassSelector = true; }
      else if (target === 'arcane-knight-spells.base') { initialClass = 'Arcane Knight'; hideClassSelector = true; }
      else if (target === 'mystic-spells.base') { initialClass = 'Mystic'; hideClassSelector = true; }
      else if (target === 'witchblade-spells.base') { initialClass = 'Witchblade'; hideClassSelector = true; }
      else if (target === 'wu-jen-spells.base') { initialClass = 'Way of the Wu Jen'; hideClassSelector = true; }
      else if (target.includes('#Cantrips')) { initialLevel = 0; }
      else if (target.includes('#1st-Level')) { initialLevel = 1; }
      else if (target.includes('#2nd-Level')) { initialLevel = 2; }
      else if (target.includes('#3rd-Level')) { initialLevel = 3; }
      else if (target.includes('#4th-Level')) { initialLevel = 4; }
      else if (target.includes('#5th-Level')) { initialLevel = 5; }
      else if (target.includes('#6th-Level')) { initialLevel = 6; }
      else if (target.includes('#7th-Level')) { initialLevel = 7; }
      else if (target.includes('#8th-Level')) { initialLevel = 8; }
      else if (target.includes('#9th-Level')) { initialLevel = 9; }

      return (
        <div className="my-6 not-prose">
          <SpellCatalogue
            initialClass={initialClass}
            initialLevel={initialLevel}
            hideClassSelector={hideClassSelector}
            onSelectSpell={onNavigate}
          />
        </div>
      );
    }

    return null;
  }

  if (block.type === 'header') {
    const text = block.rawText || '';
    if (block.level === 1) {
      return (
        <h1 className="text-2xl md:text-3xl font-bold text-amber-300 border-b border-amber-900/40 pb-2 mt-6 mb-4">
          <InlineContent text={text} onNavigate={onNavigate} />
        </h1>
      );
    }
    if (block.level === 2) {
      return (
        <h2 className="text-xl md:text-2xl font-semibold text-slate-100 border-b border-slate-800 pb-1.5 mt-6 mb-3">
          <InlineContent text={text} onNavigate={onNavigate} />
        </h2>
      );
    }
    if (block.level === 3) {
      return (
        <h3 className="text-lg md:text-xl font-medium text-amber-200 mt-4 mb-2">
          <InlineContent text={text} onNavigate={onNavigate} />
        </h3>
      );
    }
    return (
      <h4 className="text-base font-medium text-slate-200 mt-3 mb-1">
        <InlineContent text={text} onNavigate={onNavigate} />
      </h4>
    );
  }

  if (block.type === 'callout') {
    const type = block.calloutType || 'info';
    let icon = <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />;
    let border = 'border-blue-500/40 bg-blue-950/20';
    let headerText = 'text-blue-300';

    if (type === 'warning' || type === 'caution') {
      icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
      border = 'border-amber-500/40 bg-amber-950/20';
      headerText = 'text-amber-300';
    } else if (type === 'danger' || type === 'error') {
      icon = <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
      border = 'border-rose-500/40 bg-rose-950/20';
      headerText = 'text-rose-300';
    } else if (type === 'tip' || type === 'success') {
      icon = <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
      border = 'border-emerald-500/40 bg-emerald-950/20';
      headerText = 'text-emerald-300';
    }

    return (
      <div className={`rounded-xl border ${border} p-3.5 my-3 transition-all`}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 font-medium">
            {icon}
            <span className={headerText}>{block.title}</span>
          </div>
          <button className="text-slate-400 hover:text-slate-200 p-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {isOpen && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-slate-300 text-sm leading-relaxed space-y-2">
            <MarkdownView content={block.rawText || ''} onNavigate={onNavigate} />
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'table' && block.headers) {
    return (
      <div className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-inner">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-amber-200 border-b border-slate-700/80 font-medium">
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="px-3.5 py-2.5 whitespace-nowrap">
                  <InlineContent text={h} onNavigate={onNavigate} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {block.rows?.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2 text-slate-300">
                    <InlineContent text={cell} onNavigate={onNavigate} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === 'list' && block.items) {
    return (
      <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-slate-300">
        {block.items.map((item, idx) => (
          <li key={idx}>
            <InlineContent text={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'code') {
    return (
      <pre className="p-3 my-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs md:text-sm text-amber-200 overflow-x-auto">
        <code>{block.rawText}</code>
      </pre>
    );
  }

  return (
    <p className="my-2 text-slate-300 leading-relaxed">
      <InlineContent text={block.rawText || ''} onNavigate={onNavigate} />
    </p>
  );
};

export const InlineContent: React.FC<{ text: string; onNavigate: (id: string) => void }> = ({ text, onNavigate }) => {
  if (!text) return null;

  // Split by wikilinks: [[Link Target|Optional Display]] or [[Link Target]]
  // Also split bold (**text**) and italic (*text*)
  const wikilinkRegex = /\[\[(.*?)\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = wikilinkRegex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) {
      parts.push(renderFormattedText(text.substring(lastIndex, start)));
    }

    const rawLink = match[1];
    const linkParts = rawLink.split('|');
    const target = linkParts[0].trim();
    const label = linkParts[1]?.trim() || target.split('/').pop()?.replace(/\.md$/, '') || target;

    // Check if target is a base embed view (e.g. ![[ra-golvek.base]])
    if (target.endsWith('.base')) {
      parts.push(<React.Fragment key={match.index} />);
    } else {
      const resolved = resolveWikilink(target);
      if (resolved) {
        const badge = getSourceBadgeInfo(resolved.source_type, resolved.source);
        parts.push(
          <button
            key={match.index}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(resolved.id);
            }}
            title={`${resolved.title} (${badge.label})`}
            className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors mx-0.5 cursor-pointer"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 opacity-60 inline" />
          </button>
        );
      } else {
        // Fallback for unresolved wikilinks
        parts.push(
          <span key={match.index} className="text-amber-300/80 font-medium">
            {label}
          </span>
        );
      }
    }

    lastIndex = wikilinkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderFormattedText(text.substring(lastIndex)));
  }

  return <>{parts}</>;
};

function renderFormattedText(text: string): React.ReactNode {
  // Handle bold **text** and italic *text*
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-100">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={i} className="italic text-slate-200">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700">
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
