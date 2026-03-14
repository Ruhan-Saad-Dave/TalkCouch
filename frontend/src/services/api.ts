const API_URL = import.meta.env.VITE_API_URL;

export const getJamQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/jam`);
  if (!response.ok) {
    throw new Error('Failed to fetch JAM question');
  }
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

  if (!response.ok) {
    throw new Error('Failed to evaluate JAM session');
  }
  return response.json();
};

export const getJumbleQuestion = async () => {
  const response = await fetch(`${API_URL}/api/questions/v1/jumble`);
  if (!response.ok) {
    throw new Error('Failed to fetch Jumble question');
  }
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

  if (!response.ok) {
    throw new Error('Failed to evaluate Jumble');
  }
  return response.json();
};

export const getScenarioQuestion = async () => {
    const response = await fetch(`${API_URL}/api/questions/v1/scenario`);
    if (!response.ok) {
        throw new Error('Failed to fetch Scenario question');
    }
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

    if (!response.ok) {
        throw new Error('Failed to evaluate Scenario session');
    }
    return response.json();
};

export const getSpeechQuestion = async () => {
    const response = await fetch(`${API_URL}/api/questions/v1/speech`);
    if (!response.ok) {
        throw new Error('Failed to fetch Speech question');
    }
    return response.json();
};

export const evaluateSpeech = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('user_answer_audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_URL}/api/evaluation/v1/speech`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to evaluate Speech session');
    }
    return response.json();
};

export const getSummaryQuestion = async () => {
    const response = await fetch(`${API_URL}/api/questions/v1/summary`);
    if (!response.ok) {
        throw new Error('Failed to fetch Summary question');
    }
    return response.json();
};

export const evaluateSummary = async (summary: string) => {
    const response = await fetch(`${API_URL}/api/evaluation/v1/summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary }),
    });

    if (!response.ok) {
        throw new Error('Failed to evaluate Summary');
    }
    return response.json();
};
