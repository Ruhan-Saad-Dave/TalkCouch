import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from google.api_core.exceptions import ResourceExhausted # This is a common exception for quota/resource limits

# Load environment variables
load_dotenv()

def get_llm_model_for_example():
    """
    Returns a ChatGoogleGenerativeAI instance.
    Using a different function name to avoid conflict with existing lru_cache.
    """
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

def call_llm_with_error_handling(prompt: str):
    """
    Demonstrates how to call the LLM and handle potential token limit errors.
    """
    llm = get_llm_model_for_example()
    messages = [
        SystemMessage(content="You are a helpful AI assistant."),
        HumanMessage(content=prompt),
    ]

    try:
        response = llm.invoke(messages)
        print("LLM Response:")
        print(response.content)
    except ResourceExhausted as e:
        # This exception can indicate quota limits, which might include token limits
        print("--- LLM Error ---")
        print("The LLM call failed due to resource exhaustion (e.g., token limit or quota).")
        print("Please try a shorter prompt or contact support if the issue persists.")
        print(f"Original error: {e}")
    except Exception as e:
        # Catch any other unexpected errors during the LLM call
        print("--- LLM Error ---")
        print("An unexpected error occurred during the LLM call.")
        print("Please try again later or contact support.")
        print(f"Original error: {e}")

if __name__ == "__main__":
    # Example of a normal call
    print("--- Testing normal LLM call ---")
    call_llm_with_error_handling("What is the capital of France?")
    print("\n" + "="*50 + "\n")

    # Example of a call that might exceed token limits (simulated)
    # To actually trigger a token limit, you would need a very long prompt
    # or a model with a very small context window.
    # For demonstration, we'll just show how the error would be caught.
    print("--- Testing LLM call with simulated token limit error ---")
    long_prompt = "This is a very long prompt designed to potentially exceed token limits. " * 5000 # Simulate a very long prompt
    print("Attempting to send a very long prompt...")
    call_llm_with_error_handling(long_prompt)
    print("\n" + "="*50 + "\n")

    # Another example with a different type of error (e.g., invalid API key)
    # To simulate this, you might temporarily invalidate the API key in your .env
    print("--- Testing LLM call with simulated generic error (e.g., bad API key) ---")
    # Temporarily unset the API key to simulate an authentication error
    original_api_key = os.getenv("GOOGLE_API_KEY")
    if original_api_key:
        os.environ["GOOGLE_API_KEY"] = "invalid_key_for_testing"
    
    call_llm_with_error_handling("Tell me a short story.")
    
    # Restore the original API key
    if original_api_key:
        os.environ["GOOGLE_API_KEY"] = original_api_key
