import gradio as gr

from src.jumble import generate_sentences, submit_next

with gr.Blocks() as JumbleSentences:
    gr.Markdown("Write the complete sentence with Captial letters and punctuation in the correct places. Score is given based on number of correct characters.")
    question_state = gr.State([])
    answer_state = gr.State([])
    index_state = gr.State(1)
    score_state = gr.State(0)
    total_score_state = gr.State(0)
    submit_next_state = gr.State("submit")

    with gr.Row():
        generate_button = gr.Button("Generate Sentences")
    with gr.Row():
        question_label = gr.Label(value = "Click 'Generate Sentences' to start.",
                                  label = "Question Info")
    with gr.Row():
        user_answer = gr.Textbox(label = "Enter the full answer here")
        submit_next_button = gr.Button(value = "Submit", size = "sm")
    with gr.Row():
        correct_answer = gr.Label(label = "Correct Answer",
                                  value = "")
    with gr.Row():
        score_label = gr.Label(label = "Score",
                               value = "Complete all the sentences to see your score.")
        accuracy_label = gr.Label(label = "Accuracy",
                                  value = "Complete all the sentences to see your accuracy.")
        
    generate_button.click(fn = generate_sentences,
                          inputs = [],
                          outputs = [question_state, 
                                     answer_state, 
                                     question_label, 
                                     submit_next_button,
                                     user_answer,
                                     score_label,
                                     accuracy_label,
                                     index_state,
                                     score_state,
                                     total_score_state,
                                     correct_answer])
    submit_next_button.click(fn = submit_next,
                            inputs = [submit_next_state, 
                                       user_answer, 
                                       question_state, 
                                       answer_state, 
                                       index_state,
                                       score_state,
                                       total_score_state],
                            outputs = [submit_next_state,
                                       submit_next_button,
                                       user_answer,
                                       question_label,
                                       correct_answer,
                                       index_state, 
                                       score_state, 
                                       score_label,
                                       accuracy_label,
                                       total_score_state])