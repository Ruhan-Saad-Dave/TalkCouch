import gradio as gr

from src.jam import generate_topic, check_answer

# the idea is the AI will give a topic, and the user will need to talk about it for a minute.

with gr.Blocks() as JAM:
    gr.Markdown(
        "# Just A Minute (JAM)\n" 
        "Talk about the topic for atleast a minute"
    )

    topic_state = gr.State("")
    
    generate_button = gr.Button("Generate Topic")
    topic_label = gr.Label("Your topic will appear here")
    user_audio = gr.Audio(sources = ["microphone"], type="filepath", label="Record your talk here (Min 60 seconds)")
    submit_button = gr.Button("Submit Recording (May take a while to get response)")
    user_answer = gr.Label(value="Your recording will be shown as text here.", label="User's Answer")
    model_feedback = gr.Label(value="Model feedback will be shown here.", label="Model Feedback")

    generate_button.click(fn=generate_topic,
                          inputs=[],
                          outputs=[topic_label, 
                                   topic_state, 
                                   user_audio, 
                                   user_answer,
                                   model_feedback])
    
    submit_button.click(fn = check_answer,
                        inputs = [topic_state, user_audio],
                        outputs = [user_answer, model_feedback])