import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, UploadFile, Form, File, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import PyPDF2
from services.gemini_service import perform_gap_analysis, chat_with_ghost_interviewer

# ── Rate limiter setup ────────────────────────────────────────────────────────
# 5 requests per 15 minutes on auth-adjacent AI endpoints
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="CareerAgent Backend", version="2.0.0")

# Register rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "online", "version": "2.0.0", "service": "CareerAgent API"}


# ── Gap Analysis (AI) ─────────────────────────────────────────────────────────
@app.post("/api/analyze")
@limiter.limit("5/15minutes")   # Max 5 AI analyses per 15 min per IP
async def analyze_gap(
    request: Request,
    resume_file: UploadFile = File(None),
    jd_text: str = Form(...),
):
    if not jd_text or not jd_text.strip():
        raise HTTPException(status_code=422, detail="jd_text is required and cannot be empty.")

    try:
        resume_text = ""
        if resume_file and resume_file.filename:
            content = await resume_file.read()
            if len(content) > 10 * 1024 * 1024:  # 10 MB limit
                raise HTTPException(status_code=413, detail="Resume file exceeds the 10 MB size limit.")
            import io
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            resume_text = " ".join(
                page.extract_text() for page in reader.pages if page.extract_text()
            )
        else:
            resume_text = "No resume provided."

        result = perform_gap_analysis(resume_text, jd_text)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── AI Interviewer Chat ───────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    analysis_context: dict = {}
    history: list = []


@app.post("/api/chat")
@limiter.limit("30/15minutes")  # Max 30 chat messages per 15 min per IP
async def chat_ghost(request: Request, req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=422, detail="message cannot be empty.")

    try:
        reply = chat_with_ghost_interviewer(req.message, req.analysis_context, req.history)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
