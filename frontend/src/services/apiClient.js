const BASE_URL = 'http://localhost:8081/api';

export const getAuthToken = () => localStorage.getItem('farmverse_token') || '';
export const setAuthToken = (token) => localStorage.setItem('farmverse_token', token);
export const removeAuthToken = () => localStorage.removeItem('farmverse_token');

export const getCurrentUser = () => {
  const user = localStorage.getItem('farmverse_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('farmverse_user', JSON.stringify(user));
};

export async function ensureAuthenticated() {
  return getAuthToken();
}

export async function apiFetch(endpoint, options = {}) {
  await ensureAuthenticated();
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    removeAuthToken();
    localStorage.removeItem('farmverse_user');
  }

  return response;
}
