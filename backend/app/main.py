from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import review, fix

app = FastAPI(title="CodeFix AI API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with actual frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review.router, prefix="/api", tags=["Review"])
app.include_router(fix.router, prefix="/api", tags=["Fix"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CodeFix AI API"}
