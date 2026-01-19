import gradio as gr
import wave
import os

def check_audio_duration(audio_file_path):
    """
    Checks if the duration of a recorded WAV audio file is at least 60 seconds.

    Args:
        audio_file_path (str): The path to the audio file recorded by Gradio.

    Returns:
        str: A message indicating the audio duration and whether it meets the requirement.
    """
    if audio_file_path is None:
        return "No audio recorded. Please record your audio first."

    try:
        # Open the .wav file to read its properties
        with wave.open(audio_file_path, 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration_seconds = frames / float(rate)

        # Clean up the temporary file created by Gradio
        os.remove(audio_file_path)

        if duration_seconds >= 60:
            return f"Success! Audio duration is {duration_seconds:.2f} seconds, which is long enough."
        else:
            return (f"Audio is too short. "
                    f"Duration: {duration_seconds:.2f} seconds. "
                    f"Please record at least 1 minute of audio.")

    except wave.Error as e:
        return f"Error processing audio file: {e}. Please ensure you are recording in WAV format."
    except Exception as e:
        return f"An unexpected error occurred: {e}"

# --- Gradio Interface ---
with gr.Blocks() as demo:
    gr.Markdown(
        "## Audio Duration Checker\n"
        "Record audio using the component below. The system will check if the recording "
        "is at least 1 minute (60 seconds) long."
    )

    # The `type="filepath"` is crucial as it provides the path to the saved audio file.
    # The source can be 'microphone' for recording.
    audio_input = gr.Audio(sources=["microphone"], type="filepath", label="Record Your Audio (min. 60 seconds)")

    with gr.Row():
        check_button = gr.Button("Check Duration")
        reset_button = gr.Button("Reset")

    result_label = gr.Label(label="Result")

    check_button.click(
        fn=check_audio_duration,
        inputs=audio_input,
        outputs=result_label
    )

    def reset_ui():
        """Clears the audio input and the result label."""
        return None, ""

    reset_button.click(
        fn=reset_ui,
        inputs=[],
        outputs=[audio_input, result_label]
    )

if __name__ == "__main__":
    demo.launch()
