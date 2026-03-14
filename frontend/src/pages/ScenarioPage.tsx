import { useState, useRef } from 'react';
import { getScenarioQuestion, evaluateScenario } from '../services/api';
import { Button } from '@/components/ui/button';

type EvaluationFeedback = {
  user_answer: string;
  feedback: string;
};

export default function ScenarioPage() {
  const [scenario, setScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleGetQuestion = async () => {
    setLoading(true);
    setError(null);
    setScenario(null);
    setFeedback(null);
    try {
      const data = await getScenarioQuestion();
      setScenario(data.question);
    } catch (err) {
      setError('Failed to fetch scenario. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
      setFeedback(null);
    } else {
      setError("Your browser doesn't support audio recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      mediaRecorder.current.onstop = handleEvaluation;
    }
  };

  const handleEvaluation = async () => {
    if (!scenario) return;

    setEvaluating(true);
    setError(null);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    try {
      const result = await evaluateScenario(scenario, audioBlob);
      setFeedback(result);
    } catch (err) {
      setError('Failed to evaluate session. Please try again.');
      console.error(err);
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
              <Button onClick={startRecording}>Start Recording</Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>
            )}
          </div>
        </div>
      )}

      {evaluating && <p className="mt-4">Evaluating your response...</p>}

      {feedback && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Feedback:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold">What you said:</h3>
            <p>"{feedback.user_answer}"</p>
            <h3 className="font-semibold mt-4">Our analysis:</h3>
            <p>{feedback.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
