const generateBtn = document.getElementById('generate-btn');
const quizContainer = document.getElementById('quiz-container');
const questionCounter = document.getElementById('question-counter');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const correctAnswerEl = document.getElementById('correct-answer');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const scoreContainer = document.getElementById('score-container');
const pointsEl = document.getElementById('points');
const accuracyEl = document.getElementById('accuracy');

let quizId = null;
let questions = [];
let currentIndex = 0;
let scores = {};

const API_URL = 'http://127.0.0.1:8000';

generateBtn.addEventListener('click', async () => {
    const response = await fetch(`${API_URL}/api/sentences`);
    const data = await response.json();
    quizId = data.quiz_id;
    questions = data.questions;
    currentIndex = 0;
    scores = {};
    showQuestion();
    quizContainer.classList.remove('hidden');
    scoreContainer.classList.add('hidden');
    generateBtn.classList.add('hidden');
});

submitBtn.addEventListener('click', async () => {
    const userAnswer = answerInput.value;
    const response = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quiz_id: quizId,
            question_index: currentIndex,
            user_answer: userAnswer
        })
    });
    const data = await response.json();
    scores[currentIndex] = data.score;
    correctAnswerEl.textContent = data.correct_answer;
    resultContainer.classList.remove('hidden');

    if (currentIndex === questions.length - 1) {
        showFinalScore();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        showQuestion();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
    }
});

function showQuestion() {
    questionCounter.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    questionEl.textContent = questions[currentIndex];
    answerInput.value = '';
    resultContainer.classList.add('hidden');
}

function showFinalScore() {
    const totalPoints = Object.values(scores).reduce((acc, score) => acc + score, 0);
    const totalPossiblePoints = questions.reduce((acc, question) => acc + question.length, 0);
    const accuracy = (totalPoints / totalPossiblePoints) * 100;
    pointsEl.textContent = `${totalPoints}/${totalPossiblePoints}`;
    accuracyEl.textContent = accuracy.toFixed(2);
    scoreContainer.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    generateBtn.classList.remove('hidden');
}
