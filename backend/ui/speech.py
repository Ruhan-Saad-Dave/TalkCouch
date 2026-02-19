import gradio as gr 

from src.speech import generate_speech, check_correctness

with gr.Blocks() as SpeechPractice:
    gr.Markdown(
        "# Speech Practice\n"
        "Listen to the generated sentence and try to repeat it as accurately as possible. Your pronunciation will be evaluated based on correctness."
    )
    generated_text_state = gr.State("")

    with gr.Row():
        generate_button = gr.Button("Generate Sentence")
    with gr.Row():
        generated_speech = gr.Audio(label="Generated Speech", type="filepath")
    with gr.Row():
        recorded_audio = gr.Audio(sources=["microphone"], type="filepath", label="Record Your Speech")
    with gr.Row():
        submit_button = gr.Button("Submit")
    with gr.Row():
        real_answer_label = gr.Label(label="Correct Answer")
        user_answer_label = gr.Label(label="Your Answer")
        correctness_label = gr.Label(label="Correctness")

    generate_button.click(fn=generate_speech,
                          inputs=[],
                          outputs=[generated_speech, generated_text_state])
    
    submit_button.click(fn=check_correctness,
                        inputs=[recorded_audio, generated_text_state],
                        outputs=[real_answer_label,
                                 user_answer_label,
                                 correctness_label])
    
    