import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import api from '../utils/api';

const CommentSection = ({ postId, onCommentAdded, onCommentDeleted, onCommentEdited, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/posts/${postId}/comments`);
      setComments(response.data);
      //console.log('Fetched comments:', response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.post(`/api/posts/${postId}/comments`, { content });
      setComments([...comments, response.data]);
      setContent('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/posts/${postId}/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
      if (onCommentDeleted) onCommentDeleted();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const saveEdit = async (commentId) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { content: editContent });
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, content: response.data.content } : comment
      ));
      setEditingCommentId(null);
      if (onCommentEdited) onCommentEdited();
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment');
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-medium text-gray-900 mb-3">Comments</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchComments}
            className="mt-2 text-primary-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <div className="flex-shrink-0">
                <Link to={`/profile/${comment.user?.id}`}>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-medium text-primary-700 text-xs">{comment.username?.charAt(0) || 'U'}</span>
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/profile/${comment.user?.id}`} className="font-medium text-gray-900 hover:underline text-sm">
                        {comment.user?.name}
                      </Link>
                      <span className="text-xs text-gray-500 ml-2">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                      </span>
                    </div>
                    {(currentUser?.id) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="2"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditing}
                          className="flex items-center text-gray-500 hover:text-gray-700 text-xs px-2 py-1"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(comment.id)}
                          className="flex items-center bg-primary-600 text-white rounded-md text-xs px-2 py-1 hover:bg-primary-700"
                          disabled={!editContent.trim()}
                        >
                          <Check size={14} className="mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="font-medium text-primary-700 text-xs">{currentUser?.name?.charAt(0) || 'U'}</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Write a comment..."
            className="w-full border border-gray-300 rounded-full px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-primary-600 text-white rounded-full text-xs hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;