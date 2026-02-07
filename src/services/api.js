const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
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

// Game save
export const saveGame = (state) =>
  request('/game/save', { method: 'POST', body: JSON.stringify(state) });

export const loadGame = () => request('/game/load');
