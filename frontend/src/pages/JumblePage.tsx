import { useState } from 'react';
import { getJumbleQuestion, evaluateJumble } from '../services/api';
import { saveEntry } from '../lib/history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type JumbleQuestion = {
  questions: string[];
  answers: string[];
};

type SentenceResult = {
  user: string;
  correct: string;
  is_exact: boolean;
};

type JumbleFeedback = {
  score: number;
  total_score: number;
  accuracy: number;
  results: SentenceResult[];
};

export default function JumblePage() {
  const [jumble, setJumble] = useState<JumbleQuestion | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<JumbleFeedback | null>(null);

  const handleGetQuestion = async () => {
    setLoading(true);
    setError(null);
    setJumble(null);
    setFeedback(null);
    setUserAnswers([]);
    try {
      const data = await getJumbleQuestion();
      setJumble(data);
      setUserAnswers(new Array(data.questions.length).fill(''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!jumble) return;
    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateJumble(userAnswers, jumble.answers);
      setFeedback(result);
      saveEntry({ feature: 'jumble', question: jumble.questions.join(' | '), score: result.score, totalScore: result.total_score });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const correctCount = feedback?.results.filter(r => r.is_exact).length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Jumble</h1>
      <p className="mb-4">Unscramble the sentences.</p>

      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Jumble...' : 'Get Jumble'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {jumble && (
        <div className="mt-6 space-y-4">
          {jumble.questions.map((question, index) => {
            const result = feedback?.results[index];
            return (
              <div
                key={index}
                className={`p-3 rounded-md border ${
                  result
                    ? result.is_exact
                      ? 'border-green-400 bg-green-50'
                      : 'border-red-400 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-500">Sentence {index + 1}</span>
                  {result && (
                    <span className={`text-lg ${result.is_exact ? 'text-green-600' : 'text-red-500'}`}>
                      {result.is_exact ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                <p className="italic text-gray-600 text-sm mb-2">{question}</p>
                <Input
                  type="text"
                  placeholder="Your unscrambled sentence"
                  value={feedback ? result?.user ?? userAnswers[index] : userAnswers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={!!feedback}
                  className={feedback ? 'bg-white' : ''}
                />
                {result && !result.is_exact && (
                  <p className="mt-1 text-sm text-green-700">
                    <span className="font-semibold">Correct: </span>{result.correct}
                  </p>
                )}
              </div>
            );
          })}

          {!feedback && (
            <Button onClick={handleSubmit} disabled={evaluating}>
              {evaluating ? 'Evaluating...' : 'Submit Answers'}
            </Button>
          )}
        </div>
      )}

      {feedback && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p className="text-lg">
            {correctCount} / {feedback.results.length} sentences correct
          </p>
          <p className="text-gray-600">
            Character accuracy: {feedback.accuracy.toFixed(1)}%
          </p>
          <Button onClick={handleGetQuestion} className="mt-4">Try Another</Button>
        </div>
      )}
    </div>
  );
}
