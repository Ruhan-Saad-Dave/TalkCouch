import { useState } from 'react';
import { getHistory, clearHistory, FEATURE_LABELS, type HistoryEntry } from '../lib/history';
import { Button } from '@/components/ui/button';

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.timestamp).toLocaleString();

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded-full">
            {FEATURE_LABELS[entry.feature]}
          </span>
          <span className="text-sm text-gray-500">{date}</span>
          {entry.accuracy && (
            <span className="text-sm font-semibold text-blue-600">{entry.accuracy}</span>
          )}
          {entry.score !== undefined && entry.totalScore !== undefined && (
            <span className="text-sm font-semibold text-blue-600">
              {entry.score}/{entry.totalScore} chars
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          {expanded ? 'Hide ▲' : 'Show ▼'}
        </button>
      </div>

      <p className="mt-2 text-sm font-medium truncate">{entry.question}</p>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          {entry.userAnswer && (
            <div>
              <span className="font-semibold">You said: </span>
              <span className="italic text-gray-700">"{entry.userAnswer}"</span>
            </div>
          )}
          {entry.feedback && (
            <div>
              <span className="font-semibold">Feedback: </span>
              <p className="text-gray-700 whitespace-pre-wrap mt-1">{entry.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-4 text-gray-500">No sessions recorded yet. Complete a practice session to see it here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <Button variant="destructive" onClick={handleClear}>Clear All</Button>
      </div>

      <div className="space-y-3">
        {history.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
