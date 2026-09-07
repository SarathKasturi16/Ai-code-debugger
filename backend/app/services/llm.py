import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Create a common model instance we can use across agents
model = genai.GenerativeModel("gemini-3.5-flash")

async def generate_json(prompt: str) -> str:
    """Helper function to generate JSON output using Gemini."""
    response = await model.generate_content_async(
        prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
        )
    )
    return response.text

async def generate_text(prompt: str) -> str:
    """Helper function to generate text output using Gemini."""
    response = await model.generate_content_async(prompt)
    return response.text
