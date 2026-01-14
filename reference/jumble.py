import gradio as gr
from src.jumble import generate_sentences, calculate_score

def generate():
    questions, answers = generate_sentences()
    if not questions:
        return [], [], 0, "No questions", "Could not generate questions. Please try again.", "", ""
    
    question_info_text = f"Question 1 of {len(questions)}"
    jumbled_sentence_text = questions[0]
    
    return questions, answers, 0, question_info_text, jumbled_sentence_text, "", ""

def submit(user_input, questions, answers, index, scores):
    score = calculate_score(user_input, answers[index])
    scores[index] = score
    correct_answer = answers[index]
    
    current_question_possible = len(answers[index].split())
    score_text = f"Score: {score}/{current_question_possible}"

    if index == len(questions) - 1:
        total_score = sum(scores.values())
        total_possible = sum(len(s.split()) for s in answers)
        accuracy = (total_score / total_possible) * 100 if total_possible > 0 else 0
        final_score_text = f"Final Score:\nPoints: {total_score:.0f}/{total_possible}\nAccuracy: {accuracy:.2f}%"
        score_text += f"\n\n{final_score_text}"
    
    return correct_answer, score_text, scores

def next_question(questions, index):
    if index < len(questions) - 1:
        index += 1
    question_info_text = f"Question {index + 1} of {len(questions)}"
    jumbled_sentence_text = questions[index]
    return question_info_text, jumbled_sentence_text, index

def previous_question(questions, index):
    if index > 0:
        index -= 1
    question_info_text = f"Question {index + 1} of {len(questions)}"
    jumbled_sentence_text = questions[index]
    return question_info_text, jumbled_sentence_text, index

with gr.Blocks() as demo:
    questions_state = gr.State([])
    answers_state = gr.State([])
    current_index = gr.State(0)
    scores_state = gr.State({})

    with gr.Row():
        generate_button = gr.Button("Generate Sentences")

    with gr.Row():
        question_info = gr.Label(value="Click 'Generate Sentences' to start.")

    with gr.Row():
        jumbled_sentence = gr.Textbox(label="Jumbled Sentence", interactive=False)

    with gr.Row():
        user_answer = gr.Textbox(label="Your Answer")
        submit_button = gr.Button("Submit")

    with gr.Row():
        correct_answer_output = gr.Textbox(label="Correct Answer", interactive=False)

    with gr.Row():
        score_output = gr.Label()

    with gr.Row():
        prev_button = gr.Button("Previous")
        next_button = gr.Button("Next")

    generate_button.click(
        fn=generate,
        inputs=[],
        outputs=[questions_state, answers_state, current_index, question_info, jumbled_sentence, correct_answer_output, score_output]
    )

    submit_button.click(
        fn=submit,
        inputs=[user_answer, questions_state, answers_state, current_index, scores_state],
        outputs=[correct_answer_output, score_output, scores_state]
    )

    next_button.click(
        fn=next_question,
        inputs=[questions_state, current_index],
        outputs=[question_info, jumbled_sentence, current_index]
    )

    prev_button.click(
        fn=previous_question,
        inputs=[questions_state, current_index],
        outputs=[question_info, jumbled_sentence, current_index]
    )

if __name__ == "__main__":
    demo.launch()
