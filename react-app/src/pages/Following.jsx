import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { User } from 'lucide-react';

const Following = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFollowing();
  }, [userId]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${userId}/following`);
      setFollowing(response.data);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError('Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (followId) => {
    if (!currentUser) return;
    
    try {
      const isFollowing = following.find(f => f.id === followId)?.isFollowing;
      
      if (isFollowing) {
        await api.delete(`/api/users/${currentUser.id}/follow/${followId}`);
      } else {
        await api.post(`/api/users/${currentUser.id}/follow/${followId}`);
      }
      
      // Update local state
      setFollowing(following.map(f => 
        f.id === followId ? { ...f, isFollowing: !isFollowing } : f
      ));
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading following...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchFollowing}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Following</h1>
      {following.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Not following anyone yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {following.map(followedUser => (
            <div key={followedUser.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <Link to={`/profile/${followedUser.id}`} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  {followedUser.profilePhotoUrl ? (
                    <img 
                      src={"http://localhost:8081" + followedUser.profilePhotoUrl} 
                      alt={`${followedUser.name}'s avatar`}
                      className="h-full w-full object-cover rounded-full" 
                    />
                  ) : (
                    <User size={20} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{followedUser.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">{followedUser.email}</p>
                </div>
              </Link>
              {currentUser && currentUser.id !== followedUser.id && (
                <button
                  onClick={() => handleFollowToggle(followedUser.id)}
                  className={`px-4 py-2 rounded text-sm ${
                    followedUser.isFollowing 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {followedUser.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;