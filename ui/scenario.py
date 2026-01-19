import gradio as gr

from src.scenario import generate_scenario, check_answer

# the idea is the AI will give a topic, and the user will need to talk about it for a minute.

with gr.Blocks() as Scenario:
    gr.Markdown(
        "# Scenarios Based\n" 
        "Talk about what would you do in the given scenario"
    )

    scenario_state = gr.State("")
    
    generate_button = gr.Button("Generate Scenario")
    scenario_label = gr.Label("Your scenario will appear here")
    user_audio = gr.Audio(sources = ["microphone"], type="filepath", label="Record your talk here")
    submit_button = gr.Button("Submit Recording (May take a while to get response)")
    user_answer = gr.Label(value="Your recording will be shown as text here.", label="User's Answer")
    model_feedback = gr.Markdown(value="Model feedback will be shown here.")

    generate_button.click(fn=generate_scenario,
                          inputs=[],
                          outputs=[scenario_label, 
                                   scenario_state, 
                                   user_audio, 
                                   user_answer,
                                   model_feedback])
    
    submit_button.click(fn = check_answer,
                        inputs = [scenario_state, user_audio],
                        outputs = [user_answer, model_feedback])