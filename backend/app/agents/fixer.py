import json
import os
from typing import List
from app.models.schemas import FixResponse, Issue
from app.services.llm import generate_json

async def generate_fix(code: str, issues: List[Issue]) -> FixResponse:
    # 1. Read prompt
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "fixer.txt")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()
        
    # 2. Format issues
    issues_text = json.dumps([issue.model_dump() for issue in issues], indent=2)
        
    # 3. Construct LLM request
    llm_prompt = f"{system_prompt}\n\n"
    llm_prompt += f"--- IDENTIFIED ISSUES ---\n{issues_text}\n\n"
    llm_prompt += f"--- ORIGINAL PYTHON CODE ---\n{code}\n"
    
    # 4. Get response from Gemini
    response_text = await generate_json(llm_prompt)
    
    # 5. Parse and return
    try:
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        return FixResponse(
            fixed_code=data.get("fixed_code", code),
            explanation=data.get("explanation", "Applied fixes based on issues.")
        )
    except Exception as e:
        print(f"Error parsing Fixer response: {e}")
        return FixResponse(fixed_code=code, explanation="Failed to generate fix.")
