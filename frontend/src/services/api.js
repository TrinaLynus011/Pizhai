// services/api.js — All backend API calls (v2 with referral + user auth)

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = 'https://' + API_BASE;
}

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Register a new user with optional referral code */
export async function registerUser(name, referralCode = '') {
  return safeFetch(`${API_BASE}/register-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, referralCode }),
  });
}

/** Log in with an existing username */
export async function loginUser(name) {
  return safeFetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

/** Fetch Tamil practice words */
export async function getTestWords(difficulty = 'all') {
  const data = await safeFetch(`${API_BASE}/test-words?difficulty=${difficulty}`);
  return { words: data.words, details: data.details };
}

/** Upload audio blob → transcribed Tamil text */
export async function speechToText(audioBlob) {
  const form = new FormData();
  form.append('audio', audioBlob, 'recording.webm');
  return safeFetch(`${API_BASE}/speech-to-text`, { method: 'POST', body: form });
}

/**
 * Analyze pronunciation
 * @param {string} expectedWord
 * @param {string} userText
 * @param {string} userId
 * @param {string} username
 * @param {number} streak
 */
export async function analyzePronunciation(expectedWord, userText, userId = '', username = 'Guest', streak = 0) {
  return safeFetch(`${API_BASE}/analyze-pronunciation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expected_word: expectedWord,
      user_text: userText,
      user_id: userId,
      username,
      streak,
    }),
  });
}

/** Generate TTS audio for Tamil text → full URL */
export async function generateTTS(text) {
  const data = await safeFetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return { ...data, full_url: `${API_BASE}${data.audio_url}` };
}

/** Fetch leaderboard top N */
export async function getLeaderboard(limit = 10) {
  const data = await safeFetch(`${API_BASE}/leaderboard?limit=${limit}`);
  return data.leaderboard;
}

/** Get a specific user */
export async function getUser(userId) {
  return safeFetch(`${API_BASE}/user/${encodeURIComponent(userId)}`);
}

/** Health check */
export async function checkHealth() {
  return safeFetch(`${API_BASE}/health`);
}
