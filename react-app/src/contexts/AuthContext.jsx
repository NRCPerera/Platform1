import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/users/current');
        const userData = response.data;
        //console.log('Fetched user:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to authenticate. Please try logging in again.');
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
      } catch (e) {
        console.error('Invalid user data in localStorage:', e);
        localStorage.removeItem('user');
        fetchUser();
      }
    } else {
      fetchUser();
    }
  }, []);

  const loginWithOAuth = (provider) => {
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      await api.post('/api/auth/logout'); // Use relative URL to match baseURL in api.js
      console.log('Backend logout successful');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      navigate('/login', { replace: true }); // Replace history
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state and cookies
      localStorage.removeItem('user');
      setUser(null);
      // Attempt to clear cookies manually
      document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      setError('Failed to log out from server. Session cleared locally.');
      navigate('/login', { replace: true });
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithOAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};