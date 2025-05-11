/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share, User, Send, Trash, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareComment, setShareComment] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        setPost(response.data);
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likes);
        setComments(response.data.comments || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
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

  const handleShare = async () => {
    if (!user) {
      alert('Please log in to share this post');
      return;
    }

    try {
      setShareLoading(true);
      await api.post(`/api/posts/${id}/share`, { shareComment });
      alert('Post shared successfully!');
      setShowShareModal(false);
      setShareComment('');
    } catch (err) {
      console.error('Error sharing post:', err);
      alert('Failed to share post');
    } finally {
      setShareLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) {
      return;
    }

    try {
      setCommentLoading(true);
      const response = await api.post(`/api/posts/${id}/comments`, {
        content: newComment
      });
      
      // Add the new comment to the list
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.delete(`/api/posts/${id}/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="ml-2 text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={goBack}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={goBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Link
                to={`/profile/${post.user.id}`}
                className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 
                           flex items-center justify-center text-white font-medium shadow-md"
              >
                {post.user.name?.charAt(0) || 'U'}
              </Link>
              <div>
                <Link to={`/profile/${post.user.id}`} className="text-lg font-medium text-gray-900 hover:underline">
                  {post.user.name}
                </Link>
                <p className="text-sm text-gray-500">
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
            <p className="text-gray-800 text-lg mb-4">{post.content}</p>

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
            <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" />
                  <span>{likeCount} Likes</span>
                </button>
                <button 
                  onClick={focusCommentInput}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500"
                >
                  <MessageCircle size={20} />
                  <span>{comments.length} Comments</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500"
              >
                <Share size={20} />
                <span>Share</span>
              </button>
            </div>
            
            {/* Comment Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
              
              {/* Add Comment Form */}
              {user && (
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        ref={commentInputRef}
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={commentLoading}
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                        disabled={!newComment.trim() || commentLoading}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {comment.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900">{comment.username}</p>
                            {user && (user.id === comment.userId || user.id === post.user.id) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-1">
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
                <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Share Post</h2>
            <textarea
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              rows={4}
              placeholder="Add a comment to your share (optional)"
              disabled={shareLoading}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareComment('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={shareLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={shareLoading}
              >
                {shareLoading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;