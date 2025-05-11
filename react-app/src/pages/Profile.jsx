import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import PostCard from '../components/Posts/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { Edit, Check, User, Plus } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePhoto: null
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState('posts');
  const [isCreatePostFormOpen, setIsCreatePostFormOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get(`/api/users/${userId}`);
      setUser(userResponse.data);
      setFormData({
        name: userResponse.data.name || '',
        email: userResponse.data.email || '',
        bio: userResponse.data.bio || '',
        profilePhoto: null
      });
      const postsResponse = await api.get(`/api/users/${userId}/posts`);
      setPosts(postsResponse.data);
  
      try {
        const sharedPostsResponse = await api.get(`/api/posts/shared/user/${userId}`);
        if (Array.isArray(sharedPostsResponse.data)) {
          const validSharedPosts = sharedPostsResponse.data.filter(
            sharedPost => sharedPost.originalPost && 
                         sharedPost.originalPost.id && 
                         sharedPost.originalPost.user
          );
          setSharedPosts(validSharedPosts);
        } else {
          setError('Invalid shared posts response format');
          setSharedPosts([]);
        }
      } catch (sharedPostsError) {
        console.error('Error fetching shared posts:', sharedPostsError);
        setError('Failed to load shared posts');
        setSharedPosts([]);
      }
  
      if (currentUser && currentUser.id !== parseInt(userId)) {
        checkFollowStatus();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/api/users/${currentUser.id}/following/${userId}`);
      setIsFollowing(response.data);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/api/users/${currentUser.id}/follow/${userId}`);
      } else {
        await api.post(`/api/users/${currentUser.id}/follow/${userId}`);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error following/unfollowing:', err);
      alert('Failed to update follow status');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const data = new FormData();
      if (formData.name) data.append('name', formData.name);
      if (formData.email) data.append('email', formData.email);
      if (formData.bio) data.append('bio', formData.bio);
      if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);

      const response = await api.patch(`/api/users/${userId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setIsCreatePostFormOpen(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handlePostLiked = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
    setSharedPosts(sharedPosts.map(sharedPost => 
      sharedPost.originalPost.id === postId 
        ? { ...sharedPost, originalPost: { ...sharedPost.originalPost, likes: sharedPost.originalPost.likes + 1 } } 
        : sharedPost
    ));
  };

  const handleSharedPostDeleted = (sharedPostId) => {
    setSharedPosts(sharedPosts.filter(sharedPost => sharedPost.id !== sharedPostId));
  };

  const isCurrentUser = currentUser?.id === parseInt(userId);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            {user.profilePhotoUrl ? (
              <img 
                src={"http://localhost:8081" + user.profilePhotoUrl} 
                alt={`${user.name}'s avatar`}
                className="h-full w-full object-cover rounded-full" 
              />
            ) : (
              <User size={20} className="text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            
            <div className="flex gap-4 mt-2">
              <div>
                <span className="font-medium">{user?.followers?.length || 0}</span>{' '}
                <span className="text-gray-600">Followers</span>
              </div>
              <div>
                <span className="font-medium">{user?.following?.length || 0}</span>{' '}
                <span className="text-gray-600">Following</span>
              </div>
            </div>
          </div>
          
          {!isCurrentUser && (
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded ${
                isFollowing 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-900">Profile</h2>
            {isCurrentUser && (
              <button
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                className="text-primary-600 hover:text-primary-700"
              >
                {isEditing ? <Check size={18} /> : <Edit size={18} />}
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Write something about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <p className="text-gray-700"><strong>Name:</strong> {user?.name || 'Not set'}</p>
              <p className="text-gray-700"><strong>Email:</strong> {user?.email || 'Not set'}</p>
              <p className="text-gray-700"><strong>Bio:</strong> {user?.bio || (isCurrentUser ? 'Click the edit button to add a bio' : 'No bio yet')}</p>
              <p className="text-gray-700"><strong>Profile Photo:</strong> {user?.profilePhotoUrl ? <a href={"http://localhost:8081" + user.profilePhotoUrl} target="_blank" rel="noopener noreferrer">View Photo</a> : 'Not set'}</p>
            </div>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <div className="mb-4">
          <button
            onClick={() => setIsCreatePostFormOpen(!isCreatePostFormOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            {isCreatePostFormOpen ? 'Close Form' : 'Create New Post'}
          </button>

          {isCreatePostFormOpen && (
            <div className="mt-4">
              <CreatePostForm 
                onPostCreated={handlePostCreated} 
                currentUser={currentUser} 
              />
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewMode('posts')}
            className={`px-4 py-2 font-medium ${viewMode === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Posts
          </button>
          <button
            onClick={() => setViewMode('shared')}
            className={`px-4 py-2 font-medium ${viewMode === 'shared' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Shared Posts
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{viewMode === 'posts' ? 'Posts' : 'Shared Posts'}</h2>
        
        {viewMode === 'posts' && posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : viewMode === 'shared' && sharedPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No shared posts yet</p>
          </div>
        ) : viewMode === 'posts' ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
              onDelete={handlePostDeleted}
              onLike={handlePostLiked}
            />
          ))
        ) : (
          sharedPosts.map(sharedPost => (
            <div key={sharedPost.id} className="bg-white rounded-lg shadow-md mb-5">
              {sharedPost.shareComment && (
                <p className="text-gray-700 mb-3 italic">"{sharedPost.shareComment}"</p>
              )}
              <PostCard 
                post={sharedPost.originalPost} 
                currentUser={currentUser} 
                onDelete={() => handleSharedPostDeleted(sharedPost.id)}
                onLike={handlePostLiked}
              />
              {isCurrentUser && (
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this shared post?')) {
                      try {
                        await api.delete(`/api/posts/shared/${sharedPost.id}`);
                        handleSharedPostDeleted(sharedPost.id);
                      } catch (err) {
                        console.error('Error deleting shared post:', err);
                        alert('Failed to delete shared post');
                      }
                    }
                  }}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  Delete Shared Post
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;