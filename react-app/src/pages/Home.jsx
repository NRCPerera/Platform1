import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PostCard from '../components/Posts/PostCard';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      console.log('Auth still loading...');
      return;
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    console.log('User found:', user);
    fetchPosts();
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/posts');
      const fetchedPosts = Array.isArray(response.data) ? response.data : [];
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 401) {
        setError('You are not authenticated. Please log in.');
        navigate('/login');
      } else {
        setError('Failed to load posts. Please try again later.');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handlePostLiked = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      
      <h1 className="text-2xl font-bold text-black mb-4">Welcome, {user?.name}!</h1>
      <h2 className="text-2xl font-bold text-black mb-4">Here are the latest posts:</h2>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onDelete={handlePostDeleted}
              onLike={handlePostLiked}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;