import { useState, useRef, useEffect } from 'react';
import { getJamQuestion, streamEvaluateJam } from '../services/api';
import { saveEntry } from '../lib/history';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';

export default function JamPage() {
  const [question, setQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleGetQuestion = async () => {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setUserAnswer(null);
    setFeedbackText('');
    try {
      const data = await getJamQuestion();
      setQuestion(data.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeLeft(null);
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
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

    let remaining = 60;
    setTimeLeft(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setTimeLeft(null);
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
          mediaRecorder.current.stop();
          mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
        }
        setIsRecording(false);
      }
    }, 1000);
  };

  const handleEvaluation = async () => {
    if (!question) return;
    setEvaluating(true);
    setError(null);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    let transcribedAnswer = '';
    let fullFeedback = '';

    try {
      for await (const chunk of streamEvaluateJam(question, audioBlob)) {
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
      saveEntry({ feature: 'jam', question, userAnswer: transcribedAnswer, feedback: fullFeedback });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Just a Minute (JAM)</h1>
      <p className="mb-4">Speak on the topic for a minute without hesitation, repetition, or deviation.</p>

      <Button onClick={handleGetQuestion} disabled={loading || isRecording}>
        {loading ? 'Getting Topic...' : 'Get Topic'}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {question && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Your Topic:</h2>
          <p className="text-lg p-4 bg-gray-100 rounded-md">{question}</p>

          <div className="mt-4 flex items-center gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={evaluating}>Start Recording</Button>
            ) : (
              <>
                <Button onClick={stopRecording} variant="destructive">Stop Recording</Button>
                {timeLeft !== null && (
                  <span className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                    {timeLeft}s
                  </span>
                )}
              </>
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
