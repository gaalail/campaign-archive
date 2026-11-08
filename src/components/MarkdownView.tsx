import React, { useState, useMemo } from 'react';
import { resolveWikilink, getSourceBadgeInfo } from '../utils/archiveUtils';
import { AlertTriangle, Info, Lightbulb, ShieldAlert, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { SpellCatalogue } from './SpellCatalogue';
import { CompendiumEmbed } from './CompendiumEmbed';

interface MarkdownViewProps {
  content: string;
  currentEntryId?: string;
  onNavigate: (entryId: string) => void;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, currentEntryId, onNavigate }) => {
  const elements = parseMarkdownBlocks(content);

  return (
    <div className="prose prose-invert max-w-none space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
      {elements.map((el, idx) => (
        <BlockRenderer key={idx} block={el} currentEntryId={currentEntryId} onNavigate={onNavigate} />
      ))}
    </div>
  );
};

interface Block {
  type: 'header' | 'callout' | 'blockquote' | 'table' | 'list' | 'ordered-list' | 'paragraph' | 'divider' | 'code' | 'embed';
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

// Smart table row splitter that does not break on pipes inside [[link|alias]] or `code`
function splitTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);

  const cells: string[] = [];
  let current = '';
  let inWikilink = 0;
  let inCode = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const nextChar = trimmed[i + 1];

    if (char === '`') {
      inCode = !inCode;
      current += char;
    } else if (!inCode && char === '[' && nextChar === '[') {
      inWikilink++;
      current += '[[';
      i++;
    } else if (!inCode && char === ']' && nextChar === ']') {
      if (inWikilink > 0) inWikilink--;
      current += ']]';
      i++;
    } else if (char === '|' && inWikilink === 0 && !inCode) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
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

    // Header: # Heading
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

    // Standard Blockquote: > text (without [!type])
    if (line.trim().startsWith('>') && !line.match(/^>\s*\[!/)) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>') && !lines[i].match(/^>\s*\[!/)) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        rawText: quoteLines.join('\n')
      });
      continue;
    }

    // Table: starts with | and ends with |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = splitTableRow(tableLines[0]);
        // line 1 is usually separator |---|---|
        const contentRows = tableLines.slice(2).map(r => splitTableRow(r));
        blocks.push({
          type: 'table',
          headers: headerRow,
          rows: contentRows
        });
        continue;
      }
    }

    // Code block: ```lang ... ```
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

    // Ordered List: 1. Item
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, '').trim());
        i++;
      }
      blocks.push({
        type: 'ordered-list',
        items: listItems
      });
      continue;
    }

    // Unordered List: - Item or * Item
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

    // Embed: ![[target]]
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
        !lines[i].match(/^>\s*/) &&
        !lines[i].trim().startsWith('|') &&
        !lines[i].trim().startsWith('```') &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i]) &&
        !/^!\[\[.*?\]\]$/.test(lines[i].trim()) &&
        !/^(\*\*\*|---|___)$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }

      // Check if lines should preserve breaks (e.g. key-value pairs or lines ending in spaces)
      const hasExplicitBreaks = paraLines.some(l => l.endsWith('  ') || /^\*\*.*?\*\*:/.test(l.trim()));
      blocks.push({
        type: 'paragraph',
        rawText: hasExplicitBreaks ? paraLines.join('\n') : paraLines.join(' ')
      });
      continue;
    }

    i++;
  }

  return blocks;
}

const BlockRenderer: React.FC<{ block: Block; currentEntryId?: string; onNavigate: (id: string) => void }> = ({ block, currentEntryId, onNavigate }) => {
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
      else if (target.includes('#Cantrip')) { initialLevel = 0; }
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

    // All other .base queries (backgrounds.base, items.base, subclasses-of.base, etc.)
    if (target.endsWith('.base') || target.includes('.base#')) {
      return (
        <CompendiumEmbed
          target={target}
          currentEntryId={currentEntryId}
          onNavigate={onNavigate}
        />
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

  if (block.type === 'blockquote') {
    return (
      <blockquote className="my-3 border-l-2 border-amber-500/60 bg-slate-900/40 py-2.5 px-4 rounded-r-lg italic text-slate-300 space-y-2">
        <MarkdownView content={block.rawText || ''} currentEntryId={currentEntryId} onNavigate={onNavigate} />
      </blockquote>
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
            <MarkdownView content={block.rawText || ''} currentEntryId={currentEntryId} onNavigate={onNavigate} />
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

  if (block.type === 'ordered-list' && block.items) {
    return (
      <ol className="list-decimal list-outside space-y-1.5 my-2.5 pl-6 text-slate-300">
        {block.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            <InlineContent text={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === 'list' && block.items) {
    return (
      <ul className="list-disc list-outside space-y-1 my-2 pl-5 text-slate-300">
        {block.items.map((item, idx) => (
          <li key={idx}>
            <InlineContent text={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'code') {
    if (block.lang === 'statblock' || block.lang === 'monster') {
      return <StatblockRenderer rawYaml={block.rawText || ''} />;
    }
    return (
      <pre className="p-3.5 my-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs md:text-sm text-amber-200 overflow-x-auto">
        <code>{block.rawText}</code>
      </pre>
    );
  }

  // Paragraph with potential line breaks
  const raw = block.rawText || '';
  if (raw.includes('\n')) {
    const lines = raw.split('\n');
    return (
      <div className="my-2 space-y-1 text-slate-300 leading-relaxed">
        {lines.map((ln, idx) => (
          <div key={idx}>
            <InlineContent text={ln} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="my-2 text-slate-300 leading-relaxed">
      <InlineContent text={raw} onNavigate={onNavigate} />
    </p>
  );
};

export const InlineContent: React.FC<{ text: string; onNavigate: (id: string) => void }> = ({ text, onNavigate }) => {
  if (!text) return null;

  // Split by markdown elements: wikilinks [[...]], markdown links [text](url), bold/italic
  return <>{renderRichText(text, onNavigate)}</>;
};

function renderRichText(text: string, onNavigate: (id: string) => void): React.ReactNode[] {
  // Regex pattern matching wikilinks [[...]] OR standard markdown links [label](url)
  const linkRegex = /\[\[(.*?)\]\]|\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) {
      parts.push(renderFormatting(text.substring(lastIndex, start)));
    }

    if (match[1] !== undefined) {
      // It's a wikilink [[target|label]] or [[target]]
      const rawLink = match[1];
      const linkParts = rawLink.split('|');
      const target = linkParts[0].trim();
      const label = linkParts[1]?.trim() || target.split('/').pop()?.replace(/\.md$/, '') || target;

      if (target.endsWith('.base') || target.includes('.base#')) {
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
              className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors mx-0.5 cursor-pointer text-left"
            >
              <span>{label}</span>
              <ExternalLink className="w-3 h-3 opacity-60 inline shrink-0" />
            </button>
          );
        } else {
          const lowerTarget = target.toLowerCase();
          if (
            lowerTarget === 'character-builder' ||
            lowerTarget === 'builder' ||
            lowerTarget === 'spells' ||
            lowerTarget === 'items' ||
            lowerTarget === 'campaigns' ||
            lowerTarget === 'rules' ||
            lowerTarget === 'monsters' ||
            lowerTarget === 'index' ||
            lowerTarget === 'home'
          ) {
            parts.push(
              <button
                key={match.index}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(lowerTarget);
                }}
                className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors mx-0.5 cursor-pointer text-left"
              >
                <span>{label}</span>
                <ExternalLink className="w-3 h-3 opacity-60 inline shrink-0" />
              </button>
            );
          } else {
            parts.push(
              <span key={match.index} className="text-amber-300/80 font-medium">
                {label}
              </span>
            );
          }
        }
      }
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // It's a standard markdown link [label](url)
      const label = match[2];
      const url = match[3];

      if (url.startsWith('http://') || url.startsWith('https://')) {
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors mx-0.5"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 opacity-60 inline shrink-0" />
          </a>
        );
      } else {
        // Internal relative url
        const cleanTarget = url.replace(/^\.\//, '').replace(/\.md$/, '');
        const resolved = resolveWikilink(cleanTarget);
        if (resolved) {
          parts.push(
            <button
              key={match.index}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(resolved.id);
              }}
              className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors mx-0.5 cursor-pointer"
            >
              <span>{label}</span>
            </button>
          );
        } else {
          parts.push(
            <span key={match.index} className="text-amber-300 font-medium">
              {label}
            </span>
          );
        }
      }
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderFormatting(text.substring(lastIndex)));
  }

  return parts;
}

function renderFormatting(text: string): React.ReactNode {
  // Handle inline code `code`, bold-italic ***...*** / ___...___, bold **...** / __...__,
  // strikethrough ~~...~~, and italic *...* or _..._
  // Delimiter boundaries ensure identifiers with internal underscores (e.g. var_name) are preserved
  const tokens = text.split(
    /(`[^`\n]+`|\*\*\*.*?\*\*\*|___.*?___|\*\*.*?\*\*|(?<=^|[\s([{"'<-])__[^_\n]+__(?=$|[\s.,:;!?)\]}"'>-])|~~.*?~~|\*[^*\n]+?\*|(?<=^|[\s([{"'<-])_[^_\n]+_(?=$|[\s.,:;!?)\]}"'>-]))/g
  );

  return tokens.map((token, i) => {
    if (!token) return null;
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700">
          {token.slice(1, -1)}
        </code>
      );
    }
    if ((token.startsWith('***') && token.endsWith('***')) || (token.startsWith('___') && token.endsWith('___'))) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          <em className="italic">{token.slice(3, -3)}</em>
        </strong>
      );
    }
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      return <strong key={i} className="font-semibold text-slate-100">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('~~') && token.endsWith('~~')) {
      return <del key={i} className="line-through text-slate-500">{token.slice(2, -2)}</del>;
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={i} className="italic text-slate-200">{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

const StatblockRenderer: React.FC<{ rawYaml: string }> = ({ rawYaml }) => {
  const parsed = useMemo(() => {
    const lines = rawYaml.split(/\r?\n/);
    const data: Record<string, any> = { traits: [], actions: [] };
    let currentSection: 'root' | 'traits' | 'actions' = 'root';
    let currentItem: { name: string; desc: string } | null = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed === 'traits:') {
        currentSection = 'traits';
        if (currentItem) { data.traits.push(currentItem); currentItem = null; }
        continue;
      }
      if (trimmed === 'actions:') {
        currentSection = 'actions';
        if (currentItem) { data.traits.push(currentItem); currentItem = null; }
        continue;
      }

      if (currentSection === 'traits' || currentSection === 'actions') {
        const itemMatch = trimmed.match(/^-\s*name:\s*(.*)$/);
        if (itemMatch) {
          if (currentItem) {
            if (currentSection === 'traits') data.traits.push(currentItem);
            else data.actions.push(currentItem);
          }
          currentItem = { name: itemMatch[1].replace(/^["']|["']$/g, ''), desc: '' };
          continue;
        }
        const descMatch = trimmed.match(/^desc:\s*(.*)$/);
        if (descMatch && currentItem) {
          currentItem.desc = descMatch[1].replace(/^["']|["']$/g, '');
          continue;
        }
        if (currentItem && !trimmed.startsWith('-')) {
          currentItem.desc += ' ' + trimmed.replace(/^["']|["']$/g, '');
          continue;
        }
      }

      const kvMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (kvMatch) {
        let key = kvMatch[1].toLowerCase();
        let val: any = kvMatch[2].trim();
        if (val.startsWith('[') && val.endsWith(']')) {
          val = val.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
        } else {
          val = val.replace(/^["']|["']$/g, '');
        }
        data[key] = val;
      }
    }

    if (currentItem) {
      if (currentSection === 'traits') data.traits.push(currentItem);
      else data.actions.push(currentItem);
    }

    return data;
  }, [rawYaml]);

  const name = parsed.monster || parsed.name || 'Creature';
  const sizeType = [parsed.size, parsed.type, parsed.alignment].filter(Boolean).join(' • ');
  const stats = Array.isArray(parsed.stats) && parsed.stats.length >= 6 ? parsed.stats.map(Number) : [10, 10, 10, 10, 10, 10];

  const calcMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const statLabels = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  return (
    <div className="my-5 rounded-2xl border-2 border-amber-600/50 bg-slate-950 p-5 shadow-2xl space-y-4 max-w-2xl not-prose">
      {/* Title & Type */}
      <div className="border-b border-amber-900/60 pb-2.5">
        <h3 className="font-fantasy text-2xl font-bold text-amber-300">{name}</h3>
        {sizeType && <div className="text-xs text-slate-400 italic capitalize">{sizeType}</div>}
      </div>

      {/* AC, HP, Speed Bar */}
      <div className="space-y-1 text-xs border-b border-amber-900/40 pb-3">
        {parsed.ac && (
          <div><strong className="text-amber-200">Armor Class:</strong> <span className="text-slate-300">{parsed.ac}</span></div>
        )}
        {parsed.hp && (
          <div><strong className="text-amber-200">Hit Points:</strong> <span className="text-slate-300">{parsed.hp}</span></div>
        )}
        {parsed.speed && (
          <div><strong className="text-amber-200">Speed:</strong> <span className="text-slate-300">{parsed.speed}</span></div>
        )}
      </div>

      {/* Ability Scores Table */}
      <div className="grid grid-cols-6 gap-2 text-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        {statLabels.map((lbl, idx) => {
          const val = stats[idx] || 10;
          return (
            <div key={lbl} className="space-y-0.5">
              <div className="text-[10px] font-bold text-amber-400">{lbl}</div>
              <div className="text-xs font-semibold text-slate-200">{val}</div>
              <div className="text-[10px] font-mono text-slate-400">({calcMod(val)})</div>
            </div>
          );
        })}
      </div>

      {/* Defenses, Senses, Languages */}
      <div className="space-y-1 text-xs border-b border-amber-900/40 pb-3 text-slate-300">
        {parsed.skills && <div><strong className="text-amber-200">Skills:</strong> {parsed.skills}</div>}
        {parsed.damage_vulnerabilities && <div><strong className="text-amber-200">Damage Vulnerabilities:</strong> {parsed.damage_vulnerabilities}</div>}
        {parsed.damage_resistances && <div><strong className="text-amber-200">Damage Resistances:</strong> {parsed.damage_resistances}</div>}
        {parsed.damage_immunities && <div><strong className="text-amber-200">Damage Immunities:</strong> {parsed.damage_immunities}</div>}
        {parsed.condition_immunities && <div><strong className="text-amber-200">Condition Immunities:</strong> {parsed.condition_immunities}</div>}
        {parsed.senses && <div><strong className="text-amber-200">Senses:</strong> {parsed.senses}</div>}
        {parsed.languages && <div><strong className="text-amber-200">Languages:</strong> {parsed.languages}</div>}
      </div>

      {/* Traits */}
      {parsed.traits && parsed.traits.length > 0 && (
        <div className="space-y-2 border-b border-amber-900/40 pb-3">
          {parsed.traits.map((t: any, idx: number) => (
            <div key={idx} className="text-xs leading-relaxed text-slate-300">
              <strong className="text-amber-200 italic mr-1">{t.name}.</strong>
              <span>{t.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {parsed.actions && parsed.actions.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="font-fantasy text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-amber-950 pb-1">Actions</h4>
          {parsed.actions.map((a: any, idx: number) => (
            <div key={idx} className="text-xs leading-relaxed text-slate-300">
              <strong className="text-amber-200 italic mr-1">{a.name}.</strong>
              <span>{a.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
