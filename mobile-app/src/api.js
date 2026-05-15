import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000/api';

// Helper: always attach the current user's JWT
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ──────────────────────────────────────────────────────────────
// GAP ANALYSIS
// ──────────────────────────────────────────────────────────────
export const analyzeGap = async (resumeUri, jdText) => {
  const formData = new FormData();

  if (resumeUri) {
    formData.append('resume_file', {
      uri: resumeUri,
      name: 'target_resume.pdf',
      type: 'application/pdf',
    });
  }
  formData.append('jd_text', jdText || 'UNKNOWN TARGET ROLE');

  try {
    const headers = await authHeaders();
    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    });
    return response.data;
  } catch (error) {
    console.error('[API analyzeGap]', error.message);
    return {
      match_score: 0,
      cheat_sheet: [
        'System Compromised / Re-routing',
        'Host connection dropped. Fallback enabled.',
        'Ensure backend is running and EXPO_PUBLIC_API_BASE is correct.',
      ],
    };
  }
};

// ──────────────────────────────────────────────────────────────
// ANALYSES
// ──────────────────────────────────────────────────────────────
export const fetchAnalyses = async (limit = 10) => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.get(`${API_BASE}/analyses?limit=${limit}`, { headers });
    return data;
  } catch (e) {
    console.error('[API fetchAnalyses]', e.message);
    return [];
  }
};

// ──────────────────────────────────────────────────────────────
// APPLICATIONS
// ──────────────────────────────────────────────────────────────
export const fetchApplications = async (limit = 20) => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.get(`${API_BASE}/applications?limit=${limit}`, { headers });
    return data;
  } catch (e) {
    console.error('[API fetchApplications]', e.message);
    return [];
  }
};

export const createApplication = async (role, company, status = 'applied', notes = '') => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.post(
      `${API_BASE}/applications`,
      { role, company, status, notes },
      { headers }
    );
    return data;
  } catch (e) {
    console.error('[API createApplication]', e.message);
    return null;
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.patch(
      `${API_BASE}/applications/${id}`,
      { status },
      { headers }
    );
    return data;
  } catch (e) {
    console.error('[API updateApplicationStatus]', e.message);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────
// PREP SESSIONS
// ──────────────────────────────────────────────────────────────
export const fetchPrepSessions = async (limit = 10) => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.get(`${API_BASE}/prep-sessions?limit=${limit}`, { headers });
    return data;
  } catch (e) {
    console.error('[API fetchPrepSessions]', e.message);
    return [];
  }
};

export const createPrepSession = async (category, score = '', status = 'completed') => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.post(
      `${API_BASE}/prep-sessions`,
      { category, score, status },
      { headers }
    );
    return data;
  } catch (e) {
    console.error('[API createPrepSession]', e.message);
    return null;
  }
};

// ──────────────────────────────────────────────────────────────
// PROFILE
// ──────────────────────────────────────────────────────────────
export const fetchProfile = async () => {
  try {
    const headers = await authHeaders();
    const { data } = await axios.get(`${API_BASE}/profile`, { headers });
    return data;
  } catch (e) {
    console.error('[API fetchProfile]', e.message);
    return null;
  }
};
