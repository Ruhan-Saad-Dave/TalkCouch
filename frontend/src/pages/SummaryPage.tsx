import { useState, useRef } from 'react';
import { getSummaryQuestion, evaluateSummary } from '../services/api';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';

type EvaluationFeedback = {
  user_answer: string;
  feedback: string;
};

export default function SummaryPage() {
  const [question, setQuestion] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
    setQuestion(null);
    setAudioUrl(null);
    setFeedback(null);
    try {
      const data = await getSummaryQuestion();
      setQuestion(data.question);
      const audioBlob = new Blob([new Uint8Array(atob(data.audio).split("").map((c: string) => c.charCodeAt(0)))], { type: 'audio/mpeg' });
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
    if (!question) return;

    setEvaluating(true);
    setError(null);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    try {
      const result = await evaluateSummary(question, audioBlob);
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
      <h1 className="text-2xl font-bold">Summary</h1>
      <p className="mb-4">Listen to the paragraph, then explain it in your own words.</p>

      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Paragraph...' : 'Get Paragraph'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {question && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Paragraph:</h2>
          <p className="p-4 bg-gray-100 rounded-md max-h-60 overflow-y-auto">{question}</p>

          {audioUrl && (
            <div className="mt-4">
              <h3 className="font-semibold">Listen:</h3>
              <audio controls src={audioUrl} />
            </div>
          )}

          <div className="mt-4">
            {!isRecording ? (
              <Button onClick={startRecording}>Start Recording</Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>
            )}
          </div>
        </div>
      )}

      {evaluating && <p className="mt-4">Evaluating your explanation...</p>}

      {feedback && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Feedback:</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold">What you said:</h3>
            <p>"{feedback.user_answer}"</p>
            <h3 className="font-semibold mt-4">Our analysis:</h3>
            <Markdown className="prose prose-sm max-w-none">{feedback.feedback}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
