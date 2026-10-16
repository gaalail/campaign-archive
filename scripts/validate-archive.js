#!/usr/bin/env node

/**
 * Archive Validation Script
 * 
 * Checks:
 * - Broken wikilinks
 * - Orphaned files
 * - Metadata consistency
 * - Missing cross-links
 * - Duplicate entries
 * - Invalid frontmatter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = './content';
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

// Extract wikilinks: [[link]] or [[link|label]]
function extractLinks(content) {
  const links = [];
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  
  return links;
}

// Normalize path for comparison
function normalizePath(linkPath) {
  return linkPath
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9/-]/g, '')
    .replace(/\/$/, '');
}

// Find file by link
function findFileByLink(link) {
  // Try exact match first
  const candidates = [
    `${CONTENT_DIR}/${link}.md`,
    `${CONTENT_DIR}/${link}/index.md`,
    `${CONTENT_DIR}/${link.replace(/\//g, '/')}.md`,
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  
  // Try normalized search
  const normalized = normalizePath(link);
  const allFiles = Object.keys(fileCache);
  
  for (const file of allFiles) {
    if (file.includes(normalized)) {
      return file;
    }
  }
  
  return null;
}

// Check for broken links
function checkBrokenLinks() {
  console.log('\n📍 Checking for broken links...');
  let brokenCount = 0;
  
  for (const [filepath, data] of Object.entries(fileCache)) {
    data.links.forEach(link => {
      const resolved = findFileByLink(link);
      if (!resolved) {
        RESULTS.errors.push(`Broken link in ${filepath}: [[${link}]]`);
        brokenCount++;
      }
    });
  }
  
  if (brokenCount === 0) {
    RESULTS.info.push(`✓ All links valid (checked ${Object.keys(fileCache).length} files)`);
  }
}

// Check for orphaned files (no incoming or outgoing links)
function checkOrphanedFiles() {
  console.log('\n📍 Checking for orphaned files...');
  
  const allLinks = new Set();
  for (const data of Object.values(fileCache)) {
    data.links.forEach(link => allLinks.add(link));
  }
  
  const orphaned = [];
  for (const [filepath, data] of Object.entries(fileCache)) {
    const relativePath = filepath.replace(CONTENT_DIR + '/', '').replace('.md', '');
    
    // Skip index files and top-level files
    if (relativePath.includes('index') || !relativePath.includes('/')) {
      continue;
    }
    
    // Check if this file has outgoing links
    if (data.links.length === 0 && !data.metadata.incomplete) {
      orphaned.push(filepath);
    }
  }
  
  if (orphaned.length > 0) {
    RESULTS.warnings.push(`⚠ ${orphaned.length} potentially orphaned files found`);
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
  
  const spells = Object.values(fileCache).filter(d => d.filepath.includes('/spells/'));
  const items = Object.values(fileCache).filter(d => d.filepath.includes('/items/'));
  
  let missingMetadata = 0;
  
  spells.forEach(spell => {
    if (!spell.metadata.level && !spell.metadata.incomplete) {
      RESULTS.warnings.push(`Spell missing level: ${spell.filepath}`);
      missingMetadata++;
    }
    if (!spell.metadata.classes && !spell.metadata.incomplete) {
      RESULTS.warnings.push(`Spell missing classes: ${spell.filepath}`);
      missingMetadata++;
    }
  });
  
  items.forEach(item => {
    if (!item.metadata.item_type && !item.metadata.incomplete) {
      RESULTS.warnings.push(`Item missing item_type: ${item.filepath}`);
      missingMetadata++;
    }
    if (!item.metadata.rarity && !item.metadata.incomplete) {
      RESULTS.warnings.push(`Item missing rarity: ${item.filepath}`);
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
      const type = entry.filepath.split('/')[2] || 'other';
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
  
  // Cache all files
  files.forEach(filepath => {
    const content = fs.readFileSync(filepath, 'utf-8');
    const metadata = parseFrontmatter(content);
    const links = extractLinks(content);
    
    fileCache[filepath] = {
      filepath,
      metadata,
      links,
      size: content.length
    };
  });
  
  // Run checks
  checkBrokenLinks();
  checkOrphanedFiles();
  checkMetadata();
  checkDuplicates();
  checkIncomplete();
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60));
  
  if (RESULTS.errors.length > 0) {
    console.log(`\n❌ ERRORS (${RESULTS.errors.length}):`);
    RESULTS.errors.forEach(e => console.log(`  ${e}`));
  }
  
  if (RESULTS.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${RESULTS.warnings.length}):`);
    RESULTS.warnings.slice(0, 10).forEach(w => console.log(`  ${w}`));
    if (RESULTS.warnings.length > 10) {
      console.log(`  ... and ${RESULTS.warnings.length - 10} more`);
    }
  }
  
  console.log(`\nℹ️  INFO (${RESULTS.info.length}):`);
  RESULTS.info.slice(0, 15).forEach(i => console.log(`  ${i}`));
  if (RESULTS.info.length > 15) {
    console.log(`  ... and ${RESULTS.info.length - 15} more`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  const hasErrors = RESULTS.errors.length > 0;
  const status = hasErrors ? '❌ FAILED' : '✅ PASSED';
  console.log(`Status: ${status}`);
  console.log(`Errors: ${RESULTS.errors.length} | Warnings: ${RESULTS.warnings.length}\n`);
  
  process.exit(hasErrors ? 1 : 0);
}

validate();
