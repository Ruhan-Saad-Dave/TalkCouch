import gradio as gr 

from src.summary import generate_speech, check_correctness

with gr.Blocks() as SummarizationPractice:
    gr.Markdown("Listen to the generated paragraph and explain it in your own words.")
    generated_text_state = gr.State("")

    with gr.Row():
        generate_button = gr.Button("Generate Paragraph")
    with gr.Row():
        generated_speech = gr.Audio(label="Generated Paragraph", type="filepath")
    with gr.Row():
        recorded_audio = gr.Audio(sources=["microphone"], type="filepath", label="Explain the Paragraph")
    with gr.Row():
        submit_button = gr.Button("Submit")
    with gr.Row():
        real_answer_label = gr.Label(label="Original Paragraph")
    with gr.Row():
        user_answer_label = gr.Label(label="Your Answer")
    with gr.Row():
        correctness_label = gr.Label(label="Model's Feedback")

    generate_button.click(fn=generate_speech,
                          inputs=[],
                          outputs=[generated_speech, generated_text_state])
    
    submit_button.click(fn=check_correctness,
                        inputs=[recorded_audio, generated_text_state],
                        outputs=[real_answer_label,
                                 user_answer_label,
                                 correctness_label])
    
    