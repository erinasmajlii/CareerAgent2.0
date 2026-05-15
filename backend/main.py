from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
from services.gemini_service import perform_gap_analysis, chat_with_ghost_interviewer

app = FastAPI(title="CareerAgent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Terminal Active", "message": "CareerAgent Backend Online"}

@app.post("/api/analyze")
async def analyze_gap(
    resume_file: UploadFile = File(None),
    jd_text: str = Form(...)
):
    try:
        resume_text = ""
        if resume_file:
            reader = PyPDF2.PdfReader(resume_file.file)
            resume_text = " ".join(page.extract_text() for page in reader.pages if page.extract_text())
        else:
            resume_text = "No resume provided."

        result = perform_gap_analysis(resume_text, jd_text)
        return result
    except RuntimeError as re:
        if "System Compromised" in str(re):
            # Graceful fallback handled at backend
            return {
                "match_score": 0,
                "cheat_sheet": [str(re), "Re-evaluating target intel...", "Check satellite uplink."]
            }
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str
    analysis_context: dict
    history: list = []

@app.post("/api/chat")
async def chat_ghost(req: ChatRequest):
    try:
        reply = chat_with_ghost_interviewer(req.message, req.analysis_context, req.history)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
