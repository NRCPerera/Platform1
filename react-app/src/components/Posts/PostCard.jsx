/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import api from '../../utils/api';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostEditForm from './PostEditForm';
import CommentSection from '../CommentSection';

const PostCard = ({ post, currentUser, onDelete, onLike }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post?.comments?.length || 0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(post?.liked || false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareComment, setShareComment] = useState('');

  // Defensive check for undefined or invalid post
  if (!post || !post.id) {
    console.error('PostCard received invalid post prop:', post);
    return null; // Or render a fallback UI
  }

  const isAuthor = currentUser?.id === post.user?.id;
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/posts/${post.id}`);
      onDelete(post.id);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/api/posts/${post.id}/like`);
      const { liked, likeCount } = response.data;
      setIsLiked(liked);
      setLikeCount(likeCount);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      await api.post(`/api/posts/${post.id}/share`, { shareComment });
      alert('Post shared successfully!');
      setShowShareModal(false);
      setShareComment('');
    } catch (err) {
      console.error('Error sharing post:', err);
      alert('Failed to share post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (editedContent, editedMedia) => {
    try {
      const formData = new FormData();
      formData.append('content', editedContent);
      
      if (editedMedia) {
        for (let i = 0; i < editedMedia.length; i++) {
          formData.append('mediaFiles', editedMedia[i]);
        }
      }
      
      await api.put(`/api/posts/update/${post.id}`, formData);
      window.location.reload(); // or refetch posts
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Failed to update post');
      return Promise.reject(err);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentsCount(prev => prev - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-5">
      <PostHeader 
        post={post}
        isAuthor={isAuthor}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        loading={loading}
      />
      
      {isEditing ? (
        <PostEditForm 
          content={post.content}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <PostContent 
          content={post.content}
          mediaUrls={post.mediaUrls}
        />
      )}
      
      <PostActions 
        likes={likeCount || 0}
        commentsCount={commentsCount}
        isLiked={isLiked}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
        onShare={() => setShowShareModal(true)}
      />
      
      {showComments && (
        <div className="mt-4 pl-3 border-l-2 border-gray-100">
          <CommentSection
            postId={post.id}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
            currentUser={currentUser}
          />
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Share Post</h2>
            <textarea
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              rows={4}
              placeholder="Add a comment to your share..."
              disabled={loading}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareComment('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;