import gradio as gr

def change(text):
    if text == "start":
        return "stop", "stop"
    else:
        return "start", "start"
    

with gr.Blocks() as demo:
    state = gr.State("start")
    button = gr.Button(value = "start")
    button.click(fn = change,
                 inputs = [state],
                 outputs = [button, state])
    
demo.launch()

