import gradio as gr 

from ui.jumble import JumbleSentences
from ui.speech import SpeechPractice
from ui.summary import SummarizationPractice

demo = gr.TabbedInterface(
    [JumbleSentences, SpeechPractice, SummarizationPractice],
    tab_names=["Jumble Sentences", "Speech Practice", "Summarization Practice"],
    title = "Talk Couch"
)

demo.launch()