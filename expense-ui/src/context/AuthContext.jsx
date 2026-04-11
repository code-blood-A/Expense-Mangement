import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aether_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('aether_token', data.token);
    localStorage.setItem('aether_user', JSON.stringify({ username }));
    setUser({ username });
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/api/auth/register', { username, email, password });
    localStorage.setItem('aether_token', data.token);
    localStorage.setItem('aether_user', JSON.stringify({ username }));
    setUser({ username });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aether_token');
    localStorage.removeItem('aether_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
