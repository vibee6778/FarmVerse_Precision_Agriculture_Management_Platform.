import { apiFetch, setAuthToken, removeAuthToken, setCurrentUser } from './apiClient';

export const authService = {
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.accessToken || data.token || 'jwt_token_valid');
      setCurrentUser({ id: data.id, email: data.email, role: data.role, name: data.name });
      return data;
    }

    const errText = await res.text();
    throw new Error(errText || 'Invalid credentials. Authentication failed.');
  },

  async register(name, email, password, role = 'ROLE_FARMER') {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Registration failed');
    }

    try {
      return await res.json();
    } catch {
      return { message: 'User registered successfully!' };
    }
  },

  logout() {
    removeAuthToken();
    localStorage.removeItem('farmverse_user');
  },
};
