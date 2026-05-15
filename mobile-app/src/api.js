import axios from 'axios';

const API_BASE = 'http://172.20.10.3:8000/api';

export const analyzeGap = async (resumeUri, jdText) => {
  const formData = new FormData();
  
  if (resumeUri) {
    formData.append('resume_file', {
      uri: resumeUri,
      name: 'target_resume.pdf',
      type: 'application/pdf',
    });
  }
  
  formData.append('jd_text', jdText || "UNKNOWN TARGET ROLE");

  try {
    console.log(`[UPLINK] Initiating transmission to ${API_BASE}...`);
    // Note: Axios on React Native needs the Content-Type to handle bounds implicitly or explicitly as multipart
    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        return data;
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('[API Error]', error.message);
    // Graceful fallback mimicking the UI
    return {
      match_score: 0,
      cheat_sheet: [
        "System Compromised / Re-routing", 
        "Host connection dropped. Fallback enabled.", 
        "Ensure Uvicorn backend is running on 0.0.0.0 and firewall permits port 8000."
      ]
    };
  }
};
