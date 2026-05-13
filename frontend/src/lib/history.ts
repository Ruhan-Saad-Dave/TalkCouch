const STORAGE_KEY = 'talkcouch_history';
const MAX_ENTRIES = 50;

export type HistoryEntry = {
  id: string;
  feature: 'jam' | 'jumble' | 'scenario' | 'speech' | 'summary';
  timestamp: number;
  question: string;
  userAnswer?: string;
  feedback?: string;
  accuracy?: string;
  score?: number;
  totalScore?: number;
};

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const FEATURE_LABELS: Record<HistoryEntry['feature'], string> = {
  jam: 'JAM',
  jumble: 'Jumble',
  scenario: 'Scenario',
  speech: 'Speech',
  summary: 'Summary',
};
