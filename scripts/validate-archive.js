#!/usr/bin/env node

/**
 * Archive Validation Script
 * 
 * Checks:
 * - Unresolved and ambiguous wikilinks/embeds
 * - Pages without explicit incoming or outgoing wikilinks
 * - Metadata consistency
 * - Duplicate entries
 * - Incomplete entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractWikilinks, loadLinkIndex, resolveWikilink } from './link-health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.resolve(__dirname, '../content');
const RESULTS = {
  errors: [],
  warnings: [],
  info: []
};

// File cache: { filepath -> { title, links, metadata } }
const fileCache = {};

// Walk directory recursively
function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      files.push(...walkDir(fullPath));
    } else if (stat.isFile() && item.endsWith('.md') && !item.startsWith('.')) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const fm = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key.trim()) {
      fm[key.trim()] = rest.join(':').trim();
    }
  });
  
  return fm;
}

// Check for broken links
function checkWikilinks(linkIndex) {
  console.log('\n📍 Checking wikilinks...');
  let brokenCount = 0;
  let ambiguousCount = 0;

  for (const [filepath, data] of Object.entries(fileCache)) {
    const sourcePath = path.relative(CONTENT_DIR, filepath).replaceAll('\\', '/').replace(/\.md$/i, '');
    const displayPath = path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll('\\', '/');
    data.links.forEach(link => {
      const result = resolveWikilink(link, sourcePath, linkIndex);
      if (result.status === 'missing') {
        const kind = link.embed ? 'embed' : 'wikilink';
        RESULTS.errors.push(`${displayPath}:${link.line}:${link.column}: unresolved ${kind} [[${link.target}]]`);
        brokenCount++;
      } else if (result.status === 'ambiguous') {
        RESULTS.warnings.push(
          `${displayPath}:${link.line}:${link.column}: ambiguous wikilink [[${link.target}]] matches ${result.candidates.join(', ')}`,
        );
        ambiguousCount++;
      }
      link.result = result;
    });
  }

  RESULTS.info.push(
    `Wikilinks checked: ${Object.values(fileCache).reduce((count, data) => count + data.links.length, 0)}; unresolved: ${brokenCount}; ambiguous: ${ambiguousCount}.`,
  );
}

// Report content pages with neither incoming nor outgoing wikilinks.
function checkUnlinkedPages() {
  console.log('\n📍 Checking for unlinked pages...');
  const incomingLinks = new Map();
  const outgoingLinks = new Map();

  for (const [filepath, data] of Object.entries(fileCache)) {
    outgoingLinks.set(filepath, data.links.some((link) => link.result?.status === 'resolved'));
    for (const link of data.links) {
      if (link.result?.status === 'resolved' && link.result.filePath) {
        const destination = path.resolve(CONTENT_DIR, link.result.filePath);
        incomingLinks.set(destination, true);
      }
    }
  }

  const orphaned = [];
  for (const [filepath, data] of Object.entries(fileCache)) {
    const relativePath = path.relative(CONTENT_DIR, filepath);
    if (path.basename(filepath).toLowerCase() === 'index.md' || !relativePath.includes(path.sep) || data.metadata.incomplete) {
      continue;
    }
    if (!incomingLinks.has(filepath) && !outgoingLinks.get(filepath)) {
      orphaned.push(path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll('\\', '/'));
    }
  }

  if (orphaned.length > 0) {
    RESULTS.warnings.push(
      `⚠ ${orphaned.length} pages have no incoming or outgoing explicit wikilinks (generated views are not included)`,
    );
    orphaned.slice(0, 5).forEach(f => {
      RESULTS.info.push(`  - ${f}`);
    });
  } else {
    RESULTS.info.push(`✓ No orphaned files detected`);
  }
}

// Check metadata consistency
function checkMetadata() {
  console.log('\n📍 Checking metadata consistency...');
  
  const contentEntries = Object.values(fileCache).filter(
    (data) => path.basename(data.filepath).toLowerCase() !== 'index.md',
  );
  const spells = contentEntries.filter((data) =>
    path.relative(CONTENT_DIR, data.filepath).replaceAll('\\', '/').startsWith('spells/'),
  );
  const items = contentEntries.filter((data) =>
    path.relative(CONTENT_DIR, data.filepath).replaceAll('\\', '/').startsWith('items/'),
  );
  
  let missingMetadata = 0;
  
  spells.forEach(spell => {
    if (!Object.hasOwn(spell.metadata, 'level') && !spell.metadata.incomplete) {
      RESULTS.warnings.push(`Spell missing level: ${path.relative(path.dirname(CONTENT_DIR), spell.filepath).replaceAll('\\', '/')}`);
      missingMetadata++;
    }
    if (!Object.hasOwn(spell.metadata, 'classes') && !spell.metadata.incomplete) {
      RESULTS.warnings.push(`Spell missing classes: ${path.relative(path.dirname(CONTENT_DIR), spell.filepath).replaceAll('\\', '/')}`);
      missingMetadata++;
    }
  });
  
  items.forEach(item => {
    if (!Object.hasOwn(item.metadata, 'item_type') && !item.metadata.incomplete) {
      RESULTS.warnings.push(`Item missing item_type: ${path.relative(path.dirname(CONTENT_DIR), item.filepath).replaceAll('\\', '/')}`);
      missingMetadata++;
    }
    if (!Object.hasOwn(item.metadata, 'rarity') && !item.metadata.incomplete) {
      RESULTS.warnings.push(`Item missing rarity: ${path.relative(path.dirname(CONTENT_DIR), item.filepath).replaceAll('\\', '/')}`);
      missingMetadata++;
    }
  });
  
  if (missingMetadata === 0) {
    RESULTS.info.push(`✓ All metadata complete (${spells.length} spells, ${items.length} items)`);
  }
}

// Check for duplicate content
function checkDuplicates() {
  console.log('\n📍 Checking for duplicates...');
  
  const titles = {};
  let duplicates = 0;
  
  for (const [filepath, data] of Object.entries(fileCache)) {
    const title = data.metadata.title || '';
    if (title) {
      if (titles[title]) {
        RESULTS.warnings.push(`Duplicate title "${title}": ${filepath} and ${titles[title]}`);
        duplicates++;
      } else {
        titles[title] = filepath;
      }
    }
  }
  
  if (duplicates === 0) {
    RESULTS.info.push(`✓ No duplicate titles found`);
  }
}

// Check for incomplete entries
function checkIncomplete() {
  console.log('\n📍 Checking incomplete entries...');
  
  const incomplete = Object.values(fileCache).filter(d => d.metadata.incomplete);
  
  RESULTS.info.push(`ℹ ${incomplete.length} incomplete entries marked`);
  
  if (incomplete.length > 0 && incomplete.length < 500) {
    RESULTS.info.push(`Categories:`);
    const byType = {};
    incomplete.forEach(entry => {
      const type = path.relative(CONTENT_DIR, entry.filepath).split(path.sep)[0] || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });
    Object.entries(byType).forEach(([type, count]) => {
      RESULTS.info.push(`  - ${type}: ${count}`);
    });
  }
}

// Main validation
function validate() {
  console.log('🔍 Campaign Archive Validation\n');
  console.log(`Scanning ${CONTENT_DIR}...`);
  
  const files = walkDir(CONTENT_DIR);
  console.log(`Found ${files.length} markdown files\n`);
  const linkIndex = loadLinkIndex(CONTENT_DIR);
  
  // Cache all files
  files.forEach(filepath => {
    const content = fs.readFileSync(filepath, 'utf-8');
    const metadata = parseFrontmatter(content);
    const links = extractWikilinks(content);
    
    fileCache[filepath] = {
      filepath,
      metadata,
      links,
      size: content.length
    };
  });
  
  // Run checks
  checkWikilinks(linkIndex);
  checkUnlinkedPages();
  checkMetadata();
  checkDuplicates();
  checkIncomplete();
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));
  
  if (RESULTS.errors.length > 0) {
    console.log(`\n❌ ERRORS (${RESULTS.errors.length}):`);
    RESULTS.errors.slice(0, 25).forEach(e => console.log(`  ${e}`));
    if (RESULTS.errors.length > 25) {
      console.log(`  ... and ${RESULTS.errors.length - 25} more`);
    }
  }
  
  if (RESULTS.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${RESULTS.warnings.length}):`);
    RESULTS.warnings.slice(0, 25).forEach(w => console.log(`  ${w}`));
    if (RESULTS.warnings.length > 25) {
      console.log(`  ... and ${RESULTS.warnings.length - 25} more`);
    }
  }
  
  console.log(`\nℹ️  INFO (${RESULTS.info.length}):`);
  RESULTS.info.slice(0, 15).forEach(i => console.log(`  ${i}`));
  if (RESULTS.info.length > 15) {
    console.log(`  ... and ${RESULTS.info.length - 15} more`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  const hasErrors = RESULTS.errors.length > 0;
  const status = process.argv.includes('--report-only')
    ? 'REPORT ONLY — findings reported; exit code will be 0'
    : hasErrors
      ? '❌ FAILED'
      : '✅ PASSED';
  console.log(`Status: ${status}`);
  console.log(`Errors: ${RESULTS.errors.length} | Warnings: ${RESULTS.warnings.length}\n`);
  
  process.exit(hasErrors && !process.argv.includes('--report-only') ? 1 : 0);
}

validate();
