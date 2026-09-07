from fastapi import APIRouter
from app.models.schemas import FixRequest, FixResponse
from app.agents.fixer import generate_fix

router = APIRouter()

@router.post("/fix", response_model=FixResponse)
async def apply_fix(request: FixRequest):
    # This will call the Gemini fixer agent
    result = await generate_fix(request.code, request.issues)
    return result
