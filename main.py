import gradio as gr 

from ui.jumble import JumbleSentences
from ui.speech import SpeechPractice

demo = gr.TabbedInterface(
    [JumbleSentences, SpeechPractice],
    tab_names=["Jumble Sentences", "Speech Practice"]
)

demo.launch()