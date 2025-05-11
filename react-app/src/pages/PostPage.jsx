/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, User } from 'lucide-react';
import api from '../utils/api';

const PostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        setPost(response.data);
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likes);
        setLoading(false);
      } catch (err) {
        setError('Failed to load post');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like this post');
      return;
    }

    try {
      const response = await api.post(`/api/posts/${id}/like`);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-20 px-4 sm:px-6 lg:px-80">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Link
              to={`/profile/${post.user.id}`}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 
                         flex items-center justify-center text-white font-medium shadow-md"
            >
              {post.user.name?.charAt(0) || 'U'}
            </Link>
            <div>
              <Link to={`/profile/${post.user.id}`} className="text-lg font-medium text-gray-100 hover:underline">
                {post.user.name}
              </Link>
              <p className="text-sm text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6">
          <p className="text-gray-200 text-lg mb-4">{post.content}</p>

          {/* Media */}
          {post.mediaUrls?.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mb-4">
              {post.mediaUrls.map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video controls className="w-full h-auto">
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={url} alt="Post media" className="w-full h-auto object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mb-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likeCount} Likes</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MessageCircle size={20} />
              <span>{post.comments?.length || 0} Comments</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Comments</h3>
          {post.comments?.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                    {comment.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{comment.userName}</p>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;