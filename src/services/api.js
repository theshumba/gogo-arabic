const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: getHeaders(),
    });

    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response from server');
    }

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
}

// Auth
export const register = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// User
export const getProfile = () => request('/user/profile');
export const updateProfile = (data) =>
  request('/user/profile', { method: 'PUT', body: JSON.stringify(data) });

// Vocab / Review
export const syncCards = (cards) =>
  request('/review/sync', { method: 'POST', body: JSON.stringify({ cards }) });

export const getCards = () => request('/review/cards');

// Quest
export const syncQuests = (quests) =>
  request('/quest/sync', { method: 'POST', body: JSON.stringify({ quests }) });

// NOTE (Phase 103-01 audit): the game save/load/resolveConflict client helpers
// were removed as dead code (their only consumer, services/sync.js, was deleted).
// They will be replaced by the /api/v1/cloudsave/* client in Plan 06. The
// remaining exports above (register/login/getProfile/syncCards/syncQuests) are
// now orphaned too — Plan 05 (OTP auth) should reuse or remove them.
