import { useState, useEffect } from 'react';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiKey, setApiKey, clearApiKey } from '../lib/apiKey';

export default function SettingsPage() {
  const [keyInput, setKeyInput] = useState('');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(!!getApiKey());
  }, []);

  const handleSave = () => {
    if (!keyInput.trim()) return;
    setApiKey(keyInput);
    setKeyInput('');
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    clearApiKey();
    setKeyInput('');
    setHasKey(false);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-gray-500 mt-1 mb-6">Manage your API key for TalkCouch.</p>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">Why do I need an API key?</p>
        <p>
          TalkCouch uses Google Gemini AI to generate questions and evaluate your responses.
          Each user provides their own key so usage stays within your personal quota — your key
          is stored only in your browser and is never sent to or stored on our servers.
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 font-semibold text-blue-700 hover:underline"
        >
          Get your free API key at Google AI Studio
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Current status
          </label>
          {hasKey ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              API key saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              No API key — features will not work
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            {hasKey ? 'Replace API key' : 'Enter API key'}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={visible ? 'text' : 'password'}
                placeholder="AIza..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={handleSave} disabled={!keyInput.trim()}>
              Save
            </Button>
          </div>
        </div>

        {saved && (
          <p className="text-sm text-green-600 font-medium">API key saved successfully.</p>
        )}

        {hasKey && (
          <Button variant="outline" onClick={handleClear} className="text-red-600 border-red-200 hover:bg-red-50">
            Remove saved key
          </Button>
        )}
      </div>
    </div>
  );
}
