import { useState, useRef } from 'react';
import { getScenarioQuestion, streamEvaluateScenario } from '../services/api';
import { saveEntry } from '../lib/history';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';

export default function ScenarioPage() {
  const [scenario, setScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleGetQuestion = async () => {
    setLoading(true);
    setError(null);
    setScenario(null);
    setUserAnswer(null);
    setFeedbackText('');
    try {
      const data = await getScenarioQuestion();
      setScenario(data.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't support audio recording.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) => { audioChunks.current.push(e.data); };
    mediaRecorder.current.onstop = handleEvaluation;
    mediaRecorder.current.start();
    setIsRecording(true);
    setUserAnswer(null);
    setFeedbackText('');
    setError(null);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const handleEvaluation = async () => {
    if (!scenario) return;
    setEvaluating(true);
    setError(null);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    let transcribedAnswer = '';
    let fullFeedback = '';

    try {
      for await (const chunk of streamEvaluateScenario(scenario, audioBlob)) {
        if (chunk.type === 'answer') {
          transcribedAnswer = chunk.value;
          setUserAnswer(chunk.value);
        } else if (chunk.type === 'token') {
          fullFeedback += chunk.value;
          setFeedbackText(prev => prev + chunk.value);
        } else if (chunk.type === 'error') {
          setError(chunk.value);
          return;
        }
      }
      saveEntry({ feature: 'scenario', question: scenario, userAnswer: transcribedAnswer, feedback: fullFeedback });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Scenario</h1>
      <p className="mb-4">Respond to the given scenario.</p>

      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Scenario...' : 'Get Scenario'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {scenario && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Your Scenario:</h2>
          <p className="text-lg p-4 bg-gray-100 rounded-md">{scenario}</p>

          <div className="mt-4">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={evaluating}>Start Recording</Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>
            )}
          </div>
        </div>
      )}

      {evaluating && !userAnswer && (
        <p className="mt-4 text-gray-500 animate-pulse">Transcribing your audio...</p>
      )}

      {userAnswer !== null && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Feedback:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold">What you said:</h3>
            <p className="italic text-gray-700">"{userAnswer}"</p>
            {feedbackText && (
              <>
                <h3 className="font-semibold mt-4">Our analysis:</h3>
                <Markdown className="prose prose-sm max-w-none">{feedbackText}</Markdown>
              </>
            )}
            {evaluating && (
              <p className="text-sm text-gray-400 mt-2 animate-pulse">Generating feedback...</p>
            )}
          </div>
          {!evaluating && <Button onClick={handleGetQuestion} className="mt-4">Try Another</Button>}
        </div>
      )}
    </div>
  );
}
