import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LearningPlans from './pages/LearningPlans';
import NotFound from './pages/NotFound';
import ProgressUpdates from './pages/ProgressUpdates';
import Notifications from './pages/Notifications';
import PostPage from './pages/PostPage';

function OAuth2Callback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}

function App() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.assign('/login')} // Fallback to hard redirect
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login /> } />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<OAuth2Callback />} />
      
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Home />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="learning-plans" element={<LearningPlans />} />
        <Route path="/progress-update" element={<ProgressUpdates />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/post/:id" element={<PostPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;