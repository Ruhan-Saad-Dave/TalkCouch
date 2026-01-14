import gradio as gr 

from ui.jumble import JumbleSentences

with gr.Blocks() as demo:
    gr.Markdown("# Jumble Sentences Exercise")
    JumbleSentences.render()

demo.launch()