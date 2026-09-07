import json
import os
from app.models.schemas import ReviewResponse, Issue
from app.analyzers.ruff import run_ruff_analysis
from app.services.llm import generate_json

async def review_code(code: str) -> ReviewResponse:
    # 1. Get Ruff static analysis
    ruff_issues = await run_ruff_analysis(code)
    
    # 2. Read prompt
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "reviewer.txt")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()
        
    # 3. Construct LLM request
    llm_prompt = f"{system_prompt}\n\n"
    llm_prompt += f"--- RUFF STATIC ANALYSIS ---\n{json.dumps(ruff_issues, indent=2)}\n\n"
    llm_prompt += f"--- PYTHON CODE ---\n{code}\n"
    
    # 4. Get response from Gemini
    response_text = await generate_json(llm_prompt)
    
    # 5. Parse and return
    try:
        # Strip markdown formatting if Gemini added it
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        
        issues = []
        for item in data.get("issues", []):
            issues.append(Issue(**item))
            
        return ReviewResponse(issues=issues)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        print(f"Raw response: {response_text}")
        return ReviewResponse(issues=[])
