import gradio as gr 
import os

from ui.jumble import JumbleSentences
from ui.speech import SpeechPractice
from ui.summary import SummarizationPractice
from ui.jam import Jam
from ui.scenario import Scenario

demo = gr.TabbedInterface(
    [JumbleSentences, SpeechPractice, SummarizationPractice, Jam, Scenario],
    tab_names=["Jumble Sentences", "Speech Practice", "Summarization Practice", "Just A Minute (JAM)", "Scenario Based"],
    title="TalkCouch"
)

demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", 7860)))