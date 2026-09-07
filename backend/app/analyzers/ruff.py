import tempfile
import subprocess
import json
import os

async def run_ruff_analysis(code: str) -> list:
    """
    Runs Ruff static analysis on the provided Python code.
    Returns a list of issues found.
    """
    # Create a temporary file to run Ruff on
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
        temp_file.write(code)
        temp_path = temp_file.name

    try:
        import sys
        result = subprocess.run(
            [sys.executable, "-m", "ruff", "check", temp_path, "--output-format", "json"],
            capture_output=True,
            text=True
        )
        
        # Ruff returns non-zero exit code if it finds issues
        try:
            issues = json.loads(result.stdout)
        except json.JSONDecodeError:
            issues = []
            
        # Clean up the output to make it simpler for the LLM
        formatted_issues = []
        for issue in issues:
            formatted_issues.append({
                "rule": issue.get("code"),
                "message": issue.get("message"),
                "line": issue.get("location", {}).get("row")
            })
            
        return formatted_issues

    finally:
        # Ensure cleanup
        if os.path.exists(temp_path):
            os.unlink(temp_path)
