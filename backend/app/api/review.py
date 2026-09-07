from fastapi import APIRouter
from app.models.schemas import CodeRequest, ReviewResponse
from app.agents.reviewer import review_code

router = APIRouter()

@router.post("/review", response_model=ReviewResponse)
async def create_review(request: CodeRequest):
    # This will call the Ruff analyzer and the Gemini reviewer agent
    result = await review_code(request.code)
    return result
