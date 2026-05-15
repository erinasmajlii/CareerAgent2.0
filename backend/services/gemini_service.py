import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

USE_MOCKS = os.getenv("USE_MOCKS", "False").lower() in ("true", "1", "yes", "t")

def perform_gap_analysis(resume_text: str, jd_text: str) -> dict:
    if USE_MOCKS:
        return {
            "match_score": 85,
            "cheat_sheet": [
                "Swap 'managed team' with 'led engineering squad' to match JD phrasing.",
                "Highlight your experience with Google Cloud, it's a key requirement.",
                "(MOCK) Culture check: Stock is up, they value agility."
            ]
        }

    try:
        client = genai.Client()
        
        system_instruction = (
            "You are a cutting-edge cyber-analyst. Compare the target's resume against the Job Description. "
            "IMPORTANT: Use the Google Search tool to conduct a 'Culture Vibe Check' (find recent news, stock performance, "
            "or culture details about the hiring company). "
            "Based on the gap analysis and the vibe check, provide exactly a JSON output containing: "
            "1. 'match_score': An integer from 0-100 indicating raw resume/JD match. "
            "2. 'cheat_sheet': A list of exactly 3 devastatingly sharp, actionable strings the user MUST change in their resume."
        )

        prompt = f"Job Description:\n{jd_text}\n\nResume Extracted Text:\n{resume_text}"

        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                tools=[{"google_search": {}}]
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        print(f"[ERROR] Gemini Uplink Failed: {e}")
        raise RuntimeError("System Compromised / Re-routing")

def chat_with_ghost_interviewer(message: str, analysis_context: dict, history: list) -> str:
    if USE_MOCKS:
        return "MOCK RECRUITER: That answer was weak. Can you optimize it for O(log n) time complexity, or should we end this here?"
    
    try:
        client = genai.Client()
        system_instruction = (
            f"You are a cynical, high-stakes technical recruiter. Using this gap analysis context: {json.dumps(analysis_context)}, "
            f"Ask a devastatingly sharp interview question to the user based on their message. Do not be nice. Be professional but highly challenging."
        )
        
        prompt = f"Applicant says: {message}"
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        return response.text
    except Exception as e:
        print(f"[ERROR] Ghost Chat Uplink Failed: {e}")
        return "CONNECTION LOST. THE RECRUITER HUNG UP."
