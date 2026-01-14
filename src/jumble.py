from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import random
import os
import re
import gradio as gr

load_dotenv()

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash"
)

number = 10
message = f"Generate {number} sentences which are unrelated to each other. These sentences will be used for jumbling sentence quiz. Only give the result and dont give any numbers at the beginning."

def generate_sentences():
    try:
        response = model.invoke(message)
        result = response.content
        sentences = result.strip().split("\n")
        answers = [sentence.strip() for sentence in sentences if sentence.strip()]
        # Remove any numbering from the model's output
        answers = [re.sub(r'^\d+\.\s*', '', sentence) for sentence in answers]
        if not answers:
            # Create a dummy list of 10 values for the outputs
            return [], [], gr.Label(value="No sentences generated.", label="Error"), gr.Button(value="Submit", interactive=False), "Error", "Error", 1, 0, 0, ""
        
        words = [sentence.split() for sentence in answers]
        questions = [ws[:] for ws in words] # Create a copy of the word lists
        for question in questions:
            random.shuffle(question)
        jumbled_sentences = [" ".join(question) for question in questions]
        first_question = jumbled_sentences[0]
        question_label = gr.Label(value=first_question, label=f"Question 1 of {len(jumbled_sentences)}")
        
        # Reset scores and labels
        score_label_reset = "Complete all the sentences to see your score."
        accuracy_label_reset = "Complete all the sentences to see your accuracy."
        index_reset = 1
        score_reset = 0
        total_score_reset = 0
        correct_answer_reset = ""

        return (
            jumbled_sentences, 
            answers, 
            question_label, 
            gr.Button(value="Submit", interactive=True),
            score_label_reset,
            accuracy_label_reset,
            index_reset,
            score_reset,
            total_score_reset,
            correct_answer_reset
        )
    except Exception as e:
        print(f"Error generating sentences: {e}")
        # Return dummy values for all outputs
        return [], [], gr.Label(value=f"Error: {e}", label="Error"), gr.Button(value="Submit", interactive=False), "Error", "Error", 1, 0, 0, ""

def submit_answer(user_answer, question_state, answer_state, index_state, score_state, total_score_state):
    # Normalize by making lowercase and removing punctuation
    user_words = re.findall(r'\w+', user_answer.lower())
    correct_words = re.findall(r'\w+', answer_state[index_state-1].lower())
    
    score = 0
    for i in range(min(len(user_words), len(correct_words))):
        if user_words[i] == correct_words[i]:
            score += 1
    
    score_state += score
    total_score_state += len(correct_words)
    
    question_label = gr.Label(value=question_state[index_state - 1], label=f"Question {index_state} of {len(question_state)}")

    score_text = "Complete all the sentences to see your score."
    accuracy_text = "Complete all the sentences to see your accuracy."

    if index_state == len(question_state):
        # Last question, calculate and show final score
        final_accuracy = (score_state / total_score_state) * 100 if total_score_state else 0
        score_text = f"Final Score: {score_state} / {total_score_state}"
        accuracy_text = f"Final Accuracy: {final_accuracy:.2f}%"

    return "next", gr.Button(value="Next", interactive=True), question_label, answer_state[index_state - 1], index_state , score_state, score_text, accuracy_text, total_score_state

def next_question(user_answer, question_state, answer_state, index_state, score_state, total_score_state):
    if index_state < len(question_state):
        index_state += 1
        question_info_text = f"Question {index_state} of {len(question_state)}"
        jumbled_sentence_text = question_state[index_state - 1]
        question_label = gr.Label(value=jumbled_sentence_text, label=question_info_text)
        
        score_text = "Complete all the sentences to see your score."
        accuracy_text = "Complete all the sentences to see your accuracy."

        return "submit", gr.Button(value="Submit", interactive=True), question_label, "", index_state, score_state, score_text, accuracy_text, total_score_state
    else:
        # End of quiz
        question_label = gr.Label(value="You have completed all questions. Please generate new sentences.", label="Finished")
        
        final_accuracy = (score_state / total_score_state) * 100 if total_score_state else 0
        score_text = f"Final Score: {score_state} / {total_score_state}"
        accuracy_text = f"Final Accuracy: {final_accuracy:.2f}%"

        return "submit", gr.Button(value="Submit", interactive=False), question_label, "", index_state, score_state, score_text, accuracy_text, total_score_state

def submit_next(submit_next_state, user_answer, question_state, answer_state, index_state, score_state, total_score_state):
    if submit_next_state == "submit":
        return submit_answer(user_answer, question_state, answer_state, index_state, score_state, total_score_state) 
    else:
        return next_question(user_answer, question_state, answer_state, index_state, score_state, total_score_state)