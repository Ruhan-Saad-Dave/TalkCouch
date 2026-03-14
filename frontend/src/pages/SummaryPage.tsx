import { useState } from 'react';
import { getSummaryQuestion, evaluateSummary } from '../services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type EvaluationFeedback = {
  feedback: string;
};

export default function SummaryPage() {
  const [question, setQuestion] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);

  const handleGetQuestion = async () => {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setFeedback(null);
    setSummary('');
    try {
      const data = await getSummaryQuestion();
      setQuestion(data.question);
    } catch (err) {
      setError('Failed to fetch text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!summary) return;

    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateSummary(summary);
      setFeedback(result);
    } catch (err) {
      setError('Failed to evaluate summary. Please try again.');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Summary</h1>
      <p className="mb-4">Summarize the given text.</p>

      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Text...' : 'Get Text to Summarize'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {question && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Text:</h2>
          <p className="p-4 bg-gray-100 rounded-md max-h-60 overflow-y-auto">{question}</p>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Your Summary:</h2>
            <Textarea
              placeholder="Write your summary here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
            />
          </div>
          <Button onClick={handleSubmit} disabled={evaluating || !summary} className="mt-2">
            {evaluating ? 'Evaluating...' : 'Submit Summary'}
          </Button>
        </div>
      )}

      {feedback && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Feedback:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <p>{feedback.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
