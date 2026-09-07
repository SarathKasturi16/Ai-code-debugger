from typing import List, Optional
from pydantic import BaseModel

class CodeRequest(BaseModel):
    code: str

class Issue(BaseModel):
    id: str
    title: str
    severity: str # e.g. "high", "medium", "low"
    line: int
    category: str # e.g. "BUG", "SECURITY", "PERFORMANCE", "CODE QUALITY"
    explanation: str
    suggested_fix: str

class ReviewResponse(BaseModel):
    issues: List[Issue]

class FixRequest(BaseModel):
    code: str
    issues: List[Issue]

class FixResponse(BaseModel):
    fixed_code: str
    explanation: str
