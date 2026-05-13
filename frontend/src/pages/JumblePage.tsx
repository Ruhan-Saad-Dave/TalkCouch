import { useState } from 'react';
import { getJumbleQuestion, evaluateJumble } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type JumbleQuestion = {
  questions: string[];
  answers: string[];
};

type JumbleFeedback = {
  score: number;
  total_score: number;
  accuracy: number;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Jumble</h1>
      <p className="mb-4">Unscramble the sentences.</p>

      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Jumble...' : 'Get Jumble'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {jumble && (
        <div className="mt-6">
          {jumble.questions.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{`Sentence ${index + 1}:`}</p>
              <p className="italic text-gray-600 mb-2">{question}</p>
              <Input
                type="text"
                placeholder="Your unscrambled sentence"
                value={userAnswers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={evaluating}>
            {evaluating ? 'Evaluating...' : 'Submit Answers'}
          </Button>
        </div>
      )}

      {feedback && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Results:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <p>You scored {feedback.score} out of {feedback.total_score}.</p>
            <p>Accuracy: {feedback.accuracy.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
