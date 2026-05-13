const API_URL = import.meta.env.VITE_API_URL;

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((e: { msg: string }) => e.msg).join(', ');
  } catch {
    // ignore parse failure
  }
  return `Request failed (HTTP ${response.status})`;
}

export const getJamQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/jam`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const evaluateJam = async (question: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('user_answer_audio', audioBlob, 'recording.webm');

  const response = await fetch(`${API_URL}/api/evaluation/v1/jam`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const getJumbleQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/jumble`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const evaluateJumble = async (userAnswers: string[], correctAnswers: string[]) => {
  const response = await fetch(`${API_URL}/api/evaluation/v1/jumble`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_answers: userAnswers, correct_answers: correctAnswers }),
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const getScenarioQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/scenario`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const evaluateScenario = async (scenario: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('scenario', scenario);
  formData.append('user_answer_audio', audioBlob, 'recording.webm');

  const response = await fetch(`${API_URL}/api/evaluation/v1/scenario`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const getSpeechQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/speech`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const evaluateSpeech = async (question: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('user_answer_audio', audioBlob, 'recording.webm');

  const response = await fetch(`${API_URL}/api/evaluation/v1/speech`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const getSummaryQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/summary`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};

export const evaluateSummary = async (summaryQuestion: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('summary_question', summaryQuestion);
  formData.append('user_answer_audio', audioBlob, 'recording.webm');

  const response = await fetch(`${API_URL}/api/evaluation/v1/summary`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
};
