import { useState, useRef } from 'react';
import { getSpeechQuestion, evaluateSpeech } from '../services/api';
import { saveEntry } from '../lib/history';
import { Button } from '@/components/ui/button';

type EvaluationFeedback = {
  user_answer: string;
  accuracy: string;
};

export default function SpeechPage() {
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
      const data = await getSpeechQuestion();
      setQuestion(data.question);
      const audioBlob = new Blob([new Uint8Array(atob(data.audio).split("").map(c => c.charCodeAt(0)))], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
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
    setEvaluating(true);
    setError(null);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    try {
      const result = await evaluateSpeech(question!, audioBlob);
      setFeedback(result);
      saveEntry({ feature: 'speech', question: question!, userAnswer: result.user_answer, accuracy: result.accuracy });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Speech</h1>
      <p className="mb-4">Deliver a speech on the given topic.</p>
      
      <Button onClick={handleGetQuestion} disabled={loading}>
        {loading ? 'Getting Topic...' : 'Get Topic'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {question && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Your Topic:</h2>
          <p className="text-lg p-4 bg-gray-100 rounded-md">{question}</p>

          {audioUrl && (
            <div className="mt-4">
                <h3 className="font-semibold">Listen to this for inspiration:</h3>
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

      {evaluating && <p className="mt-4">Evaluating your speech...</p>}

      {feedback && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Results:</h2>
          <div className="p-4 bg-gray-100 rounded-md space-y-2">
            <p><strong>Accuracy:</strong> {feedback.accuracy}</p>
            <p><strong>Your transcription:</strong> {feedback.user_answer}</p>
          </div>
          <Button onClick={handleGetQuestion} className="mt-4">Try Another</Button>
        </div>
      )}
    </div>
  );
}
