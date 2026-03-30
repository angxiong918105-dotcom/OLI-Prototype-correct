import type { JournalEntry, PatternInsight } from '../types/journal';

// Minimum requirements to generate a pattern insight.
export const PATTERN_MIN_ENTRIES = 3;
export const PATTERN_MIN_MODULES = 2;

export function hasEnoughForPattern(entries: JournalEntry[]): boolean {
  if (entries.length < PATTERN_MIN_ENTRIES) return false;
  const uniqueModules = new Set(entries.map((e) => e.moduleId));
  return uniqueModules.size >= PATTERN_MIN_MODULES;
}

type EntryInput = {
  moduleId: string;
  moduleTitle?: string;
  selectedSignals?: string[];
  reflectionText?: string;
};

/**
 * Calls /api/pattern with the most recent entries (up to 6).
 * The caller is responsible for checking hasEnoughForPattern() first.
 */
export async function generatePatternInsight(
  entries: JournalEntry[],
): Promise<PatternInsight> {
  // Use up to 6 most recent entries
  const recent = [...entries].slice(-6);

  const payload: EntryInput[] = recent.map((e) => ({
    moduleId: e.moduleId,
    moduleTitle: e.moduleTitle,
    selectedSignals: e.selectedSignals,
    reflectionText: e.reflectionText,
  }));

  const response = await fetch('/api/pattern', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries: payload }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pattern API error (${response.status}): ${errText}`);
  }

  const data = await response.json();

  if (typeof data.pattern !== 'string' || typeof data.next_step !== 'string') {
    throw new Error('Invalid pattern insight response shape');
  }

  return {
    pattern: data.pattern.trim(),
    next_step: data.next_step.trim(),
    generatedAt: new Date().toISOString(),
    basedOnEntryIds: recent.map((e) => e.id),
  };
}
