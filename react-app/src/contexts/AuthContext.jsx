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
        setUser(userData);  // Set the full user data in the state
        localStorage.setItem('user', JSON.stringify(userData)); // Save the full user data to localStorage
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

  const registerUser = async (formData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithCredentials = async (email, password) => {
  try {
    setError(null);
    const response = await api.post(
      '/api/auth/login', // <-- this must be the actual Spring login endpoint
      new URLSearchParams({
        email: email, // must be 'username', not 'email'
        password: password,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        withCredentials: true, // important for session-based auth
      }
    );

    console.log('Login response:', response.data);
      setUser(response.data?.user || { email }); // or however you fetch user data
      return response.data;
    } catch (err) {
      let errorMessage = 'Login failed';
      if (err.response) {
        if (err.response.status === 401 || err.response.data?.message?.includes('Bad credentials')) {
          errorMessage = 'Invalid email or password';
        } else {
          errorMessage = err.response.data?.message || err.response.data?.error || 'Login failed';
        }
      } else {
        errorMessage = err.message || 'Login failed';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
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
    registerUser,
    loginWithCredentials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};